import { Notification } from "../../../domain/entities/Notification";
import { RepositoryError } from "../../../domain/errors/RepositoryError";
import {
  CreateNotificationRecord,
  FindNotificationsQuery,
  INotificationRepository
} from "../../../domain/repositories/INotificationRepository";
import {
  NotificationDocument,
  NotificationModel
} from "../models/NotificationModel";

const mapNotification = (document: NotificationDocument): Notification => {
  return {
    id: document.id,
    tenantId: document.tenantId,
    eventType: document.eventType,
    channel: document.channel,
    message: document.message,
    ...(typeof document.recipientUserId === "string"
      ? { recipientUserId: document.recipientUserId }
      : {}),
    ...(typeof document.donationId === "string"
      ? { donationId: document.donationId }
      : {}),
    ...(typeof document.urgentNeedId === "string"
      ? { urgentNeedId: document.urgentNeedId }
      : {}),
    createdAt: document.createdAt instanceof Date ? document.createdAt : new Date(0)
  };
};

export class MongoNotificationRepository implements INotificationRepository {
  async create(record: CreateNotificationRecord): Promise<Notification> {
    try {
      const notification = await NotificationModel.create({
        tenantId: record.tenantId,
        eventType: record.eventType,
        channel: record.channel,
        message: record.message,
        ...(record.recipientUserId ? { recipientUserId: record.recipientUserId } : {}),
        ...(record.donationId ? { donationId: record.donationId } : {}),
        ...(record.urgentNeedId ? { urgentNeedId: record.urgentNeedId } : {})
      });

      return mapNotification(notification);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`Notification creation failed: ${message}`);
    }
  }

  async findByQuery(query: FindNotificationsQuery): Promise<Notification[]> {
    try {
      const filters: Record<string, unknown> = {
        tenantId: query.tenantId
      };

      if (query.channel) {
        filters.channel = query.channel;
      }

      if (query.recipientUserId) {
        filters.$or = [
          { recipientUserId: query.recipientUserId },
          { recipientUserId: { $exists: false } },
          { recipientUserId: null }
        ];
      }

      const notifications = await NotificationModel.find(filters)
        .sort({ createdAt: -1 })
        .exec();

      return notifications.map(mapNotification);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`Notification query failed: ${message}`);
    }
  }
}
