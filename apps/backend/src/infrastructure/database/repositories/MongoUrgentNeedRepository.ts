import { UrgentNeed } from "../../../domain/entities/UrgentNeed";
import { RepositoryError } from "../../../domain/errors/RepositoryError";
import {
  CreateUrgentNeedRecord,
  IUrgentNeedRepository
} from "../../../domain/repositories/IUrgentNeedRepository";
import {
  UrgentNeedDocument,
  UrgentNeedModel
} from "../models/UrgentNeedModel";

const mapUrgentNeed = (document: UrgentNeedDocument): UrgentNeed => {
  const normalizedLinkedDonationId =
    typeof document.linkedDonationId === "string"
      ? document.linkedDonationId.trim()
      : "";

  return {
    id: document.id,
    tenantId: document.tenantId,
    description: document.description,
    priority: document.priority,
    ...(normalizedLinkedDonationId.length > 0
      ? { linkedDonationId: normalizedLinkedDonationId }
      : {}),
    createdAt: document.createdAt instanceof Date ? document.createdAt : new Date(0)
  };
};

export class MongoUrgentNeedRepository implements IUrgentNeedRepository {
  async create(record: CreateUrgentNeedRecord): Promise<UrgentNeed> {
    try {
      const urgentNeed = await UrgentNeedModel.create({
        tenantId: record.tenantId,
        description: record.description,
        priority: record.priority,
        ...(record.linkedDonationId ? { linkedDonationId: record.linkedDonationId } : {})
      });

      return mapUrgentNeed(urgentNeed);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`UrgentNeed creation failed: ${message}`);
    }
  }

  async findByTenantId(tenantId: string): Promise<UrgentNeed[]> {
    try {
      const urgentNeeds = await UrgentNeedModel.find({ tenantId })
        .sort({ createdAt: -1 })
        .exec();

      return urgentNeeds.map(mapUrgentNeed);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`UrgentNeed query failed: ${message}`);
    }
  }
}
