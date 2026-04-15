import {
  Notification,
  NotificationChannel,
  NotificationEventType
} from "../entities/Notification";

export interface CreateNotificationRecord {
  tenantId: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  message: string;
  recipientUserId?: string;
  donationId?: string;
  urgentNeedId?: string;
}

export interface FindNotificationsQuery {
  tenantId: string;
  channel?: NotificationChannel;
  recipientUserId?: string;
}

export interface INotificationRepository {
  create(record: CreateNotificationRecord): Promise<Notification>;
  findByQuery(query: FindNotificationsQuery): Promise<Notification[]>;
}
