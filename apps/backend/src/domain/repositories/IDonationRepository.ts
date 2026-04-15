import { Donation, DonationStatus } from "../entities/Donation";

export type DonationStatusUpdate = Extract<DonationStatus, "requested" | "picked_up" | "delivered">;

export interface CreateDonationRecord {
  tenantId: string;
  donorId: string;
  title: string;
  quantity: number;
  status: DonationStatus;
  expirationDate: Date;
  donorPhoto?: string;
}

export interface UpdateDonationStatusRecord {
  donationId: string;
  tenantId: string;
  currentStatus: DonationStatus;
  status: DonationStatusUpdate;
  requestedByTenantId?: string;
  assignedVolunteerId?: string;
  pickupPhoto?: string;
  deliveryPhoto?: string;
}

export interface IDonationRepository {
  create(record: CreateDonationRecord): Promise<Donation>;
  findByIdAndTenant(donationId: string, tenantId: string): Promise<Donation | null>;
  findByTenantId(tenantId: string): Promise<Donation[]>;
  updateStatus(record: UpdateDonationStatusRecord): Promise<Donation | null>;
}