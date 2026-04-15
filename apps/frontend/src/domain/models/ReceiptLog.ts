export interface ReceiptLog {
  id: string;
  tenantId: string;
  donationId: string;
  donationTitle: string;
  quantityKg: number;
  deliveredAt: string;
  receivedBy: string;
  pickupPhoto?: string;
  deliveryPhoto?: string;
}