import { ValidationError } from "../../domain/errors/ValidationError";
import { IDonationRepository } from "../../domain/repositories/IDonationRepository";
import {
  ImpactCalculatorService,
  ImpactStats
} from "../services/ImpactCalculatorService";

export interface ImpactStatsResponse extends ImpactStats {
  deliveredDonationsCount: number;
}

export class GetImpactStatsUseCase {
  constructor(
    private readonly donationRepository: IDonationRepository,
    private readonly impactCalculatorService: ImpactCalculatorService
  ) {}

  async execute(tenantId: string): Promise<ImpactStatsResponse> {
    const normalizedTenantId = tenantId.trim();

    if (normalizedTenantId.length === 0) {
      throw new ValidationError("tenantId is required.");
    }

    const tenantDonations = await this.donationRepository.findByTenantId(normalizedTenantId);
    const deliveredDonations = tenantDonations.filter(
      (donation) => donation.status === "delivered"
    );

    const rescuedFoodKg = deliveredDonations.reduce((sum, donation) => {
      return sum + donation.quantity;
    }, 0);

    const impactStats = this.impactCalculatorService.calculate(rescuedFoodKg);

    return {
      deliveredDonationsCount: deliveredDonations.length,
      ...impactStats
    };
  }
}
