export interface ReceiptLog {
  id: string;
  tenantId: string;
  donationId: string;
  donorId: string;
  quantity: number;
  receivedAt: Date;
}
