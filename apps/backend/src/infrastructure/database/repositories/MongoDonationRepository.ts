import { isValidObjectId } from "mongoose";
import { Donation } from "../../../domain/entities/Donation";
import { RepositoryError } from "../../../domain/errors/RepositoryError";
import {
  CreateDonationRecord,
  IDonationRepository,
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

  async updateStatus(record: UpdateDonationStatusRecord): Promise<Donation | null> {
    try {
      if (!isValidObjectId(record.donationId)) {
        return null;
      }

      const updateSet: Record<string, string> = {
        status: record.status
      };

      if (record.status === "requested") {
        if (record.requestedByTenantId) {
          updateSet.requestedByTenantId = record.requestedByTenantId;
        }

        if (record.assignedVolunteerId) {
          updateSet.assignedVolunteerId = record.assignedVolunteerId;
        }
      }

      if (record.status === "picked_up" && record.pickupPhoto) {
        updateSet.pickupPhoto = record.pickupPhoto;
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
}