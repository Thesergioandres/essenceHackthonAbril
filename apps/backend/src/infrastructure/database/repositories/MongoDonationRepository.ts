import { isValidObjectId } from "mongoose";
import { Donation } from "../../../domain/entities/Donation";
import { RepositoryError } from "../../../domain/errors/RepositoryError";
import {
  CreateDonationRecord,
  IDonationRepository,
  RecoverOverduePickupRecord,
  UpdateDonationStatusRecord
} from "../../../domain/repositories/IDonationRepository";
import { DonationDocument, DonationModel } from "../models/DonationModel";

const mapDonation = (document: DonationDocument): Donation => {
  return {
    id: document.id,
    tenantId: document.tenantId,
    donorId: document.donorId,
    title: document.title,
    quantity: document.quantity,
    status: document.status,
    expirationDate: document.expirationDate,
    assignedAt: document.assignedAt instanceof Date ? document.assignedAt : new Date(0),
    reassignmentCount:
      Number.isFinite(document.reassignmentCount) && document.reassignmentCount >= 0
        ? document.reassignmentCount
        : 0,
    ...(typeof document.requestedByTenantId === "string"
      ? { requestedByTenantId: document.requestedByTenantId }
      : {}),
    ...(typeof document.assignedVolunteerId === "string"
      ? { assignedVolunteerId: document.assignedVolunteerId }
      : {}),
    ...(typeof document.donorPhoto === "string"
      ? { donorPhoto: document.donorPhoto }
      : {}),
    ...(typeof document.pickupPhoto === "string"
      ? { pickupPhoto: document.pickupPhoto }
      : {}),
    ...(typeof document.deliveryPhoto === "string"
      ? { deliveryPhoto: document.deliveryPhoto }
      : {})
  };
};

export class MongoDonationRepository implements IDonationRepository {
  async create(record: CreateDonationRecord): Promise<Donation> {
    try {
      const donation = await DonationModel.create({
        tenantId: record.tenantId,
        donorId: record.donorId,
        title: record.title,
        quantity: record.quantity,
        status: record.status,
        expirationDate: record.expirationDate,
        assignedAt: new Date(),
        reassignmentCount: 0,
        ...(record.donorPhoto ? { donorPhoto: record.donorPhoto } : {})
      });

      return mapDonation(donation);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`Donation creation failed: ${message}`);
    }
  }

  async findByIdAndTenant(donationId: string, tenantId: string): Promise<Donation | null> {
    try {
      if (!isValidObjectId(donationId)) {
        return null;
      }

      const donation = await DonationModel.findOne({
        _id: donationId,
        tenantId
      }).exec();

      return donation ? mapDonation(donation) : null;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`Donation query by id failed: ${message}`);
    }
  }

  async findByTenantId(tenantId: string): Promise<Donation[]> {
    try {
      const donations = await DonationModel.find({ tenantId })
        .sort({ expirationDate: 1 })
        .exec();

      return donations.map(mapDonation);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`Donation query failed: ${message}`);
    }
  }

  async findPickedUpOverdue(cutoffDate: Date): Promise<Donation[]> {
    try {
      const donations = await DonationModel.find({
        status: "picked_up",
        assignedAt: { $lte: cutoffDate },
        assignedVolunteerId: { $exists: true, $ne: "" }
      })
        .sort({ assignedAt: 1 })
        .exec();

      return donations.map(mapDonation);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`Overdue pickup query failed: ${message}`);
    }
  }

  async updateStatus(record: UpdateDonationStatusRecord): Promise<Donation | null> {
    try {
      if (!isValidObjectId(record.donationId)) {
        return null;
      }

      const updateSet: Record<string, unknown> = {
        status: record.status
      };

      if (record.status === "requested") {
        if (record.assignedAt instanceof Date) {
          updateSet.assignedAt = record.assignedAt;
        }

        if (record.requestedByTenantId) {
          updateSet.requestedByTenantId = record.requestedByTenantId;
        }

        if (record.assignedVolunteerId) {
          updateSet.assignedVolunteerId = record.assignedVolunteerId;
        }
      }

      if (record.status === "picked_up" && record.pickupPhoto) {
        updateSet.pickupPhoto = record.pickupPhoto;

        if (record.assignedAt instanceof Date) {
          updateSet.assignedAt = record.assignedAt;
        }
      }

      if (record.status === "delivered" && record.deliveryPhoto) {
        updateSet.deliveryPhoto = record.deliveryPhoto;
      }

      const updatedDonation = await DonationModel.findOneAndUpdate(
        {
          _id: record.donationId,
          tenantId: record.tenantId,
          status: record.currentStatus
        },
        {
          $set: updateSet
        },
        {
          new: true
        }
      ).exec();

      return updatedDonation ? mapDonation(updatedDonation) : null;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`Donation status update failed: ${message}`);
    }
  }

  async recoverOverduePickup(record: RecoverOverduePickupRecord): Promise<Donation | null> {
    try {
      if (!isValidObjectId(record.donationId)) {
        return null;
      }

      const recoveredDonation = await DonationModel.findOneAndUpdate(
        {
          _id: record.donationId,
          tenantId: record.tenantId,
          status: "picked_up",
          assignedVolunteerId: record.assignedVolunteerId,
          assignedAt: { $lte: record.cutoffDate }
        },
        {
          $set: {
            status: "requested",
            assignedAt: record.reassignedAt
          },
          $unset: {
            assignedVolunteerId: ""
          },
          $inc: {
            reassignmentCount: 1
          }
        },
        {
          new: true
        }
      ).exec();

      return recoveredDonation ? mapDonation(recoveredDonation) : null;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`Overdue pickup recovery failed: ${message}`);
    }
  }
}