import { Donation, DonationStatus } from "../entities/Donation";

export type DonationStatusUpdate = Extract<DonationStatus, "in_transit" | "delivered">;

export interface CreateDonationRecord {
  tenantId: string;
  title: string;
  quantity: number;
  status: DonationStatus;
  expirationDate: Date;
  donorPhoto?: string;
}

export interface UpdateDonationStatusRecord {
  donationId: string;
  tenantId: string;
  status: DonationStatusUpdate;
  photo: string;
}

export interface IDonationRepository {
  create(record: CreateDonationRecord): Promise<Donation>;
  findByTenantId(tenantId: string): Promise<Donation[]>;
  updateStatus(record: UpdateDonationStatusRecord): Promise<Donation | null>;
}