import { IDonationRepository } from "../../domain/repositories/IDonationRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;

export interface DeliveryGuaranteeResult {
  scannedCount: number;
  recoveredCount: number;
  penalizedUsers: number;
  recoveredDonationIds: string[];
}

export class DeliveryGuaranteeService {
  constructor(
    private readonly donationRepository: IDonationRepository,
    private readonly userRepository: IUserRepository,
    private readonly overdueWindowMs: number = TWO_HOURS_IN_MS
  ) {}

  async recoverOverduePickups(now: Date = new Date()): Promise<DeliveryGuaranteeResult> {
    const cutoffDate = new Date(now.getTime() - this.overdueWindowMs);
    const overdueDonations = await this.donationRepository.findPickedUpOverdue(cutoffDate);

    const recoveredDonationIds: string[] = [];
    let penalizedUsers = 0;

    for (const donation of overdueDonations) {
      if (typeof donation.assignedVolunteerId !== "string") {
        continue;
      }

      const assignedVolunteerId = donation.assignedVolunteerId.trim();

      if (assignedVolunteerId.length === 0) {
        continue;
      }

      const recoveredDonation = await this.donationRepository.recoverOverduePickup({
        donationId: donation.id,
        tenantId: donation.tenantId,
        assignedVolunteerId,
        cutoffDate,
        reassignedAt: now
      });

      if (!recoveredDonation) {
        continue;
      }

      recoveredDonationIds.push(recoveredDonation.id);

      const penalizedUser = await this.userRepository.incrementPenalties(
        assignedVolunteerId,
        1
      );

      if (penalizedUser) {
        penalizedUsers += 1;
      }
    }

    return {
      scannedCount: overdueDonations.length,
      recoveredCount: recoveredDonationIds.length,
      penalizedUsers,
      recoveredDonationIds
    };
  }
}
