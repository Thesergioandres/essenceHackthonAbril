import { ReceiptLog } from "../../domain/entities/ReceiptLog";
import { ValidationError } from "../../domain/errors/ValidationError";
import { IReceiptLogRepository } from "../../domain/repositories/IReceiptLogRepository";

export class ListReceiptHistoryUseCase {
  constructor(private readonly receiptLogRepository: IReceiptLogRepository) {}

  async execute(tenantId: string): Promise<ReceiptLog[]> {
    const normalizedTenantId = tenantId.trim();

    if (normalizedTenantId.length === 0) {
      throw new ValidationError("tenantId is required.");
    }

    return this.receiptLogRepository.findByTenantId(normalizedTenantId);
  }
}
