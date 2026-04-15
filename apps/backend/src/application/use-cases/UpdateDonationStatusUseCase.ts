import { Donation } from "../../domain/entities/Donation";
import { ForbiddenError } from "../../domain/errors/ForbiddenError";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { ValidationError } from "../../domain/errors/ValidationError";
import {
  DonationStatusUpdate,
  IDonationRepository
} from "../../domain/repositories/IDonationRepository";
import { IReceiptLogRepository } from "../../domain/repositories/IReceiptLogRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import {
  isFoundationRole,
  isVolunteerRole
} from "../policies/userRolePolicy";
import { NotificationService } from "../services/NotificationService";

export interface UpdateDonationStatusInput {
  donationId: string;
  tenantId: string;
  actorUserId: string;
  status: DonationStatusUpdate;
  assignedVolunteerId?: string;
  photo?: string;
}

const normalizePhoto = (photo: string | undefined): string => {
  if (typeof photo !== "string") {
    throw new ValidationError("photo is required.");
  }

  const trimmedPhoto = photo.trim();

  if (trimmedPhoto.length === 0) {
    throw new ValidationError("photo is required.");
  }

  return trimmedPhoto;
};

export class UpdateDonationStatusUseCase {
  constructor(
    private readonly donationRepository: IDonationRepository,
    private readonly userRepository: IUserRepository,
    private readonly receiptLogRepository: IReceiptLogRepository,
    private readonly notificationService: NotificationService
  ) {}

  async execute(input: UpdateDonationStatusInput): Promise<Donation> {
    const donationId = input.donationId.trim();
    const tenantId = input.tenantId.trim();
    const actorUserId = input.actorUserId.trim();

    if (donationId.length === 0) {
      throw new ValidationError("donationId is required.");
    }

    if (actorUserId.length === 0) {
      throw new ValidationError("actorUserId is required.");
    }

    if (tenantId.length === 0) {
      throw new ValidationError("tenantId is required.");
    }

    const actor = await this.userRepository.findById(actorUserId);

    if (!actor || actor.tenantId !== tenantId) {
      throw new NotFoundError("Actor user not found for tenant.");
    }

    const donation = await this.donationRepository.findByIdAndTenant(donationId, tenantId);

    if (!donation) {
      throw new NotFoundError("Donation not found for this tenant.");
    }

    if (input.status === "requested") {
      const assignedVolunteerId = input.assignedVolunteerId?.trim();

      if (donation.status !== "available") {
        throw new ValidationError("Donation must be available before requesting.");
      }

      if (!isFoundationRole(actor.role)) {
        throw new ForbiddenError("Only foundation admins can request a donation.");
      }

      if (!assignedVolunteerId || assignedVolunteerId.length === 0) {
        throw new ValidationError("assignedVolunteerId is required for requested status.");
      }

      const volunteer = await this.userRepository.findById(assignedVolunteerId);

      const isFoundationSelfVolunteer =
        actor.role === "foundation" && assignedVolunteerId === actor.id;

      if (
        !volunteer ||
        volunteer.tenantId !== tenantId ||
        (!isVolunteerRole(volunteer.role) && !isFoundationSelfVolunteer)
      ) {
        throw new ValidationError(
          "assignedVolunteerId must belong to a tenant volunteer or match the requesting foundation user."
        );
      }

      const updatedRequestedDonation = await this.donationRepository.updateStatus({
        donationId,
        tenantId,
        currentStatus: donation.status,
        status: "requested",
        assignedAt: new Date(),
        requestedByTenantId: tenantId,
        assignedVolunteerId
      });

      if (!updatedRequestedDonation) {
        throw new ValidationError("Donation status transition failed due to stale state.");
      }

      await this.notificationService.notifyDonationRequestedForVolunteers(
        tenantId,
        donation.id,
        donation.title
      );

      return updatedRequestedDonation;
    }

    if (input.status === "picked_up") {
      if (donation.status !== "requested") {
        throw new ValidationError("Donation must be requested before pickup.");
      }

      const canOperateAsVolunteer =
        donation.assignedVolunteerId === actor.id &&
        (isVolunteerRole(actor.role) || actor.role === "foundation");

      if (!canOperateAsVolunteer) {
        throw new ForbiddenError(
          `User ${actor.name} (${actor.id}) is not the assigned volunteer for this donation.`
        );
      }

      const pickupPhoto = normalizePhoto(input.photo);

      const updatedPickedUpDonation = await this.donationRepository.updateStatus({
        donationId,
        tenantId,
        currentStatus: donation.status,
        status: "picked_up",
        assignedAt: new Date(),
        pickupPhoto
      });

      if (!updatedPickedUpDonation) {
        throw new ValidationError("Donation status transition failed due to stale state.");
      }

      await this.notificationService.notifyDonationPickedUpForDonor(
        tenantId,
        donation.donorId,
        donation.id,
        donation.title
      );

      return updatedPickedUpDonation;
    }

    if (donation.status !== "picked_up") {
      throw new ValidationError("Donation must be picked up before delivery.");
    }

    const canOperateAsVolunteer =
      donation.assignedVolunteerId === actor.id &&
      (isVolunteerRole(actor.role) || actor.role === "foundation");

    if (!canOperateAsVolunteer) {
      throw new ForbiddenError(
        `User ${actor.name} (${actor.id}) is not the assigned volunteer for this delivery.`
      );
    }

    const deliveryPhoto = normalizePhoto(input.photo);

    const updatedDeliveredDonation = await this.donationRepository.updateStatus({
      donationId,
      tenantId,
      currentStatus: donation.status,
      status: "delivered",
      deliveryPhoto
    });

    if (!updatedDeliveredDonation) {
      throw new ValidationError("Donation status transition failed due to stale state.");
    }

    await this.receiptLogRepository.create({
      tenantId,
      donationId: donation.id,
      donorId: donation.donorId,
      quantity: donation.quantity,
      receivedAt: new Date()
    });

    await this.notificationService.notifyDonationDeliveredForDonor(
      tenantId,
      donation.donorId,
      donation.id,
      donation.title
    );

    return updatedDeliveredDonation;
  }
}
