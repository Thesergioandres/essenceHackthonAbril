export type DonationStatus = "available" | "requested" | "picked_up" | "delivered";

export interface Donation {
  id: string;
  tenantId: string;
  donorId: string;
  title: string;
  quantity: number;
  status: DonationStatus;
  expirationDate: Date;
  requestedByTenantId?: string;
  assignedVolunteerId?: string;
  donorPhoto?: string;
  pickupPhoto?: string;
  deliveryPhoto?: string;
}