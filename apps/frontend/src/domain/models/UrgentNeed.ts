export type UrgentNeedPriority = "low" | "medium" | "high" | "critical";
export type UrgentNeedStatus = "open" | "matched" | "closed";

export interface UrgentNeed {
  id: string;
  tenantId: string;
  title: string;
  details: string;
  quantityNeededKg: number;
  neededBefore: string;
  priority: UrgentNeedPriority;
  status: UrgentNeedStatus;
  linkedDonationId?: string;
  createdByUserId?: string;
  createdAt: string;
}