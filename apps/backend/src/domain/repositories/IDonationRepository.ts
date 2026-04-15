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
  assignedAt?: Date;
  requestedByTenantId?: string;
  assignedVolunteerId?: string;
  pickupPhoto?: string;
  deliveryPhoto?: string;
}

export interface RecoverOverduePickupRecord {
  donationId: string;
  tenantId: string;
  assignedVolunteerId: string;
  cutoffDate: Date;
  reassignedAt: Date;
}

export interface IDonationRepository {
  create(record: CreateDonationRecord): Promise<Donation>;
  findByIdAndTenant(donationId: string, tenantId: string): Promise<Donation | null>;
  findByTenantId(tenantId: string): Promise<Donation[]>;
  findPickedUpOverdue(cutoffDate: Date): Promise<Donation[]>;
  recoverOverduePickup(record: RecoverOverduePickupRecord): Promise<Donation | null>;
  updateStatus(record: UpdateDonationStatusRecord): Promise<Donation | null>;
}