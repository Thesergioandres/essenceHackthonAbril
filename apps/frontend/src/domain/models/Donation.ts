export type DonationStatus = "pending" | "in_transit" | "delivered";

export interface Donation {
  id: string;
  tenantId: string;
  title: string;
  quantity: number;
  status: DonationStatus;
  expirationDate: string;
}