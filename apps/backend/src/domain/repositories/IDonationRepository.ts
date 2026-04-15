import { Donation, DonationStatus } from "../entities/Donation";

export interface CreateDonationRecord {
  tenantId: string;
  title: string;
  quantity: number;
  status: DonationStatus;
  expirationDate: Date;
}

export interface IDonationRepository {
  create(record: CreateDonationRecord): Promise<Donation>;
  findByTenantId(tenantId: string): Promise<Donation[]>;
}