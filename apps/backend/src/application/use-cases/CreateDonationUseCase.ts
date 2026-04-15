import { Donation } from "../../domain/entities/Donation";
import { ForbiddenError } from "../../domain/errors/ForbiddenError";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { ValidationError } from "../../domain/errors/ValidationError";
import { IDonationRepository } from "../../domain/repositories/IDonationRepository";
import { IOrganizationRepository } from "../../domain/repositories/IOrganizationRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { canCreateDonationsRole } from "../policies/userRolePolicy";
import { NotificationService } from "../services/NotificationService";

export interface CreateDonationInput {
  tenantId: string;
  donorId: string;
  title: string;
  quantity: number;
  expirationDate: Date;
  donorPhoto?: string;
}

const normalizeOptionalPhoto = (photo: string | undefined): string | undefined => {
  if (typeof photo !== "string") {
    return undefined;
  }

  const trimmedPhoto = photo.trim();

  if (trimmedPhoto.length === 0) {
    return undefined;
  }

  return trimmedPhoto;
};

export class CreateDonationUseCase {
  constructor(
    private readonly donationRepository: IDonationRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly userRepository: IUserRepository,
    private readonly notificationService: NotificationService
  ) {}

  async execute(input: CreateDonationInput): Promise<Donation> {
    const tenantId = input.tenantId.trim();
    const donorId = input.donorId.trim();
    const title = input.title.trim();

    if (tenantId.length === 0) {
      throw new ValidationError("tenantId is required.");
    }

    if (donorId.length === 0) {
      throw new ValidationError("donorId is required.");
    }

    if (title.length === 0) {
      throw new ValidationError("Donation title is required.");
    }

    if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
      throw new ValidationError("Donation quantity must be greater than zero.");
    }

    if (Number.isNaN(input.expirationDate.getTime())) {
      throw new ValidationError("Donation expirationDate must be a valid date.");
    }

    const organization = await this.organizationRepository.findByTenantId(tenantId);

    if (!organization) {
      throw new NotFoundError("Tenant organization not found.");
    }

    const donor = await this.userRepository.findById(donorId);

    if (!donor || donor.tenantId !== tenantId) {
      throw new NotFoundError("Donor user not found for tenant.");
    }

    if (!canCreateDonationsRole(donor.role)) {
      throw new ForbiddenError("Only donors or foundation admins can create donations.");
    }

    const donorPhoto = normalizeOptionalPhoto(input.donorPhoto);

    const donation = await this.donationRepository.create({
      tenantId,
      donorId,
      title,
      quantity: input.quantity,
      status: "available",
      expirationDate: input.expirationDate,
      ...(donorPhoto ? { donorPhoto } : {})
    });

    await this.notificationService.notifyDonationAvailableForFoundation(
      tenantId,
      donation.id,
      donation.title
    );

    return donation;
  }
}