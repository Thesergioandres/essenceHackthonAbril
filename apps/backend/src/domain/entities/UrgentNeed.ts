export type UrgentNeedPriority = "HIGH";

export interface UrgentNeed {
  id: string;
  tenantId: string;
  description: string;
  priority: UrgentNeedPriority;
  createdAt: Date;
}
