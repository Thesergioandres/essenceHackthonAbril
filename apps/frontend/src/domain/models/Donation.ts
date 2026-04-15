export type DonationStatus = "available" | "requested" | "picked_up" | "delivered";

export interface Donation {
  id: string;
  tenantId: string;
  title: string;
  quantity: number;
  status: DonationStatus;
  expirationDate: string;
  requestedByUserId?: string;
  urgentNeedId?: string;
  donorPhoto?: string;
  pickupPhoto?: string;
  deliveryPhoto?: string;
}