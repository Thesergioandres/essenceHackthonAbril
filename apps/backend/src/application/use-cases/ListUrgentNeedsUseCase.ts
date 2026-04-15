import { UrgentNeed } from "../../domain/entities/UrgentNeed";
import { ValidationError } from "../../domain/errors/ValidationError";
import { IUrgentNeedRepository } from "../../domain/repositories/IUrgentNeedRepository";

export class ListUrgentNeedsUseCase {
  constructor(private readonly urgentNeedRepository: IUrgentNeedRepository) {}

  async execute(tenantId: string): Promise<UrgentNeed[]> {
    const normalizedTenantId = tenantId.trim();

    if (normalizedTenantId.length === 0) {
      throw new ValidationError("tenantId is required.");
    }

    return this.urgentNeedRepository.findByTenantId(normalizedTenantId);
  }
}
