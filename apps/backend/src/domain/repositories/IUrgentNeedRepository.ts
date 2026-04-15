import { UrgentNeed, UrgentNeedPriority } from "../entities/UrgentNeed";

export interface CreateUrgentNeedRecord {
  tenantId: string;
  description: string;
  priority: UrgentNeedPriority;
  linkedDonationId?: string;
}

export interface IUrgentNeedRepository {
  create(record: CreateUrgentNeedRecord): Promise<UrgentNeed>;
  findByTenantId(tenantId: string): Promise<UrgentNeed[]>;
}
