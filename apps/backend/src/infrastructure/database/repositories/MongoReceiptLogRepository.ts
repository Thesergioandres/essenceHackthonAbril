import { ReceiptLog } from "../../../domain/entities/ReceiptLog";
import { RepositoryError } from "../../../domain/errors/RepositoryError";
import {
  CreateReceiptLogRecord,
  IReceiptLogRepository
} from "../../../domain/repositories/IReceiptLogRepository";
import {
  ReceiptLogDocument,
  ReceiptLogModel
} from "../models/ReceiptLogModel";

const mapReceiptLog = (document: ReceiptLogDocument): ReceiptLog => {
  return {
    id: document.id,
    tenantId: document.tenantId,
    donationId: document.donationId,
    donorId: document.donorId,
    quantity: document.quantity,
    receivedAt: document.receivedAt
  };
};

export class MongoReceiptLogRepository implements IReceiptLogRepository {
  async create(record: CreateReceiptLogRecord): Promise<ReceiptLog> {
    try {
      const receiptLog = await ReceiptLogModel.create({
        tenantId: record.tenantId,
        donationId: record.donationId,
        donorId: record.donorId,
        quantity: record.quantity,
        receivedAt: record.receivedAt
      });

      return mapReceiptLog(receiptLog);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`ReceiptLog creation failed: ${message}`);
    }
  }

  async findByTenantId(tenantId: string): Promise<ReceiptLog[]> {
    try {
      const logs = await ReceiptLogModel.find({ tenantId })
        .sort({ receivedAt: -1 })
        .exec();

      return logs.map(mapReceiptLog);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`ReceiptLog query failed: ${message}`);
    }
  }
}
