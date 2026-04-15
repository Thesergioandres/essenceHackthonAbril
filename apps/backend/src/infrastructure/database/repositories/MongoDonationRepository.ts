import { Donation } from "../../../domain/entities/Donation";
import { RepositoryError } from "../../../domain/errors/RepositoryError";
import {
  CreateDonationRecord,
  IDonationRepository
} from "../../../domain/repositories/IDonationRepository";
import { DonationDocument, DonationModel } from "../models/DonationModel";

const mapDonation = (document: DonationDocument): Donation => {
  return {
    id: document.id,
    tenantId: document.tenantId,
    title: document.title,
    quantity: document.quantity,
    status: document.status,
    expirationDate: document.expirationDate
  };
};

export class MongoDonationRepository implements IDonationRepository {
  async create(record: CreateDonationRecord): Promise<Donation> {
    try {
      const donation = await DonationModel.create({
        tenantId: record.tenantId,
        title: record.title,
        quantity: record.quantity,
        status: record.status,
        expirationDate: record.expirationDate
      });

      return mapDonation(donation);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`Donation creation failed: ${message}`);
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
}