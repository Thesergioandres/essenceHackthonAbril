export type NotificationChannel = "foundation" | "volunteer" | "donor";

export type NotificationEventType =
  | "DONATION_AVAILABLE"
  | "DONATION_REQUESTED"
  | "DONATION_PICKED_UP"
  | "DONATION_DELIVERED"
  | "URGENT_NEED_PUBLISHED";

export interface Notification {
  id: string;
  tenantId: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  message: string;
  recipientUserId?: string;
  donationId?: string;
  urgentNeedId?: string;
  createdAt: Date;
}
