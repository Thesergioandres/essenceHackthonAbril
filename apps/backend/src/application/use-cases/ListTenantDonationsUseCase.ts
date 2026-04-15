import { Donation } from "../../domain/entities/Donation";
import { ValidationError } from "../../domain/errors/ValidationError";
import { IDonationRepository } from "../../domain/repositories/IDonationRepository";

export class ListTenantDonationsUseCase {
  constructor(private readonly donationRepository: IDonationRepository) {}

  async execute(tenantId: string): Promise<Donation[]> {
    const normalizedTenantId = tenantId.trim();

    if (normalizedTenantId.length === 0) {
      throw new ValidationError("tenantId is required.");
    }

    return this.donationRepository.findByTenantId(normalizedTenantId);
  }
}