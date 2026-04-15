import { ReceiptLog } from "../entities/ReceiptLog";

export interface CreateReceiptLogRecord {
  tenantId: string;
  donationId: string;
  donorId: string;
  quantity: number;
  receivedAt: Date;
}

export interface IReceiptLogRepository {
  create(record: CreateReceiptLogRecord): Promise<ReceiptLog>;
  findByTenantId(tenantId: string): Promise<ReceiptLog[]>;
}
