import { Notification, NotificationSeverity } from "@/domain/models/Notification";
import { HttpError, httpClient } from "./httpClient";

interface NotificationApiEntity {
  id?: string;
  _id?: string;
  tenantId?: string;
  userId?: string;
  title?: string;
  message?: string;
  severity?: string;
  type?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt?: string;
}

const normalizeSeverity = (value: unknown): NotificationSeverity => {
  if (value === "info" || value === "warning" || value === "critical") {
    return value;
  }

  if (value === "urgent") {
    return "critical";
  }

  return "info";
};

const mapNotification = (entity: NotificationApiEntity): Notification => {
  return {
    id: entity.id ?? entity._id ?? "",
    tenantId: entity.tenantId ?? "",
    userId: entity.userId,
    title: entity.title ?? "Notificacion",
    message: entity.message ?? "",
    severity: normalizeSeverity(entity.severity ?? entity.type),
    isRead: entity.isRead ?? entity.read ?? false,
    createdAt: entity.createdAt ?? new Date().toISOString()
  };
};

export const getNotifications = async (
  tenantId?: string,
  userId?: string
): Promise<Notification[]> => {
  const response = await httpClient.get<NotificationApiEntity[]>("/notifications", {
    tenantId,
    userId
  });

  return response.map((item) => mapNotification(item));
};

export const markNotificationAsRead = async (
  notificationId: string,
  tenantId?: string,
  userId?: string
): Promise<Notification> => {
  try {
    const response = await httpClient.patch<NotificationApiEntity, Record<string, never>>(
      `/notifications/${notificationId}/read`,
      {},
      {
        tenantId,
        userId
      }
    );

    return mapNotification(response);
  } catch (error: unknown) {
    if (!(error instanceof HttpError) || error.status !== 404) {
      throw error;
    }

    const fallbackResponse = await httpClient.patch<NotificationApiEntity, { isRead: true }>(
      `/notifications/${notificationId}`,
      { isRead: true },
      {
        tenantId,
        userId
      }
    );

    return mapNotification(fallbackResponse);
  }
};