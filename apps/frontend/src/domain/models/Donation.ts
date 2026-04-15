export type DonationStatus = "available" | "requested" | "picked_up" | "delivered";

export interface Donation {
  id: string;
  tenantId: string;
  donorId?: string;
  title: string;
  quantity: number;
  status: DonationStatus;
  expirationDate: string;
  requestedByTenantId?: string;
  assignedVolunteerId?: string;
  assignedAt?: string;
  reassignmentCount?: number;
  urgentNeedId?: string;
  donorPhoto?: string;
  pickupPhoto?: string;
  deliveryPhoto?: string;
}