export type NotificationSeverity = "info" | "warning" | "critical";

export interface Notification {
  id: string;
  tenantId: string;
  userId?: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  isRead: boolean;
  createdAt: string;
}