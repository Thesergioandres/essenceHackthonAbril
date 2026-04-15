import { Donation } from "../../domain/entities/Donation";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { ValidationError } from "../../domain/errors/ValidationError";
import { IDonationRepository } from "../../domain/repositories/IDonationRepository";
import { IOrganizationRepository } from "../../domain/repositories/IOrganizationRepository";

export interface CreateDonationInput {
  tenantId: string;
  title: string;
  quantity: number;
  expirationDate: Date;
}

export class CreateDonationUseCase {
  constructor(
    private readonly donationRepository: IDonationRepository,
    private readonly organizationRepository: IOrganizationRepository
  ) {}

  async execute(input: CreateDonationInput): Promise<Donation> {
    const tenantId = input.tenantId.trim();
    const title = input.title.trim();

    if (tenantId.length === 0) {
      throw new ValidationError("tenantId is required.");
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

    if (!organization.isActive) {
      throw new ValidationError("Tenant organization is inactive.");
    }

    return this.donationRepository.create({
      tenantId,
      title,
      quantity: input.quantity,
      status: "pending",
      expirationDate: input.expirationDate
    });
  }
}