"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Notification } from "@/domain/models/Notification";
import {
  getNotifications,
  markNotificationAsRead
} from "@/infrastructure/network/notificationsApi";

interface UseNotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
}

export const useNotifications = (
  tenantId: string,
  userId: string
): UseNotificationsState => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const nextNotifications = await getNotifications(tenantId, userId);
      setNotifications(nextNotifications);
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to fetch notifications";

      setIsError(true);
      setError(message);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, userId]);

  const markAsRead = useCallback(
    async (notificationId: string): Promise<boolean> => {
      const previousNotification = notifications.find(
        (notification) => notification.id === notificationId
      );

      if (!previousNotification || previousNotification.isRead) {
        return true;
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => {
          if (notification.id !== notificationId) {
            return notification;
          }

          return {
            ...notification,
            isRead: true
          };
        })
      );

      try {
        const updatedNotification = await markNotificationAsRead(
          notificationId,
          tenantId,
          userId
        );

        setNotifications((currentNotifications) =>
          currentNotifications.map((notification) => {
            if (notification.id !== notificationId) {
              return notification;
            }

            return updatedNotification;
          })
        );

        return true;
      } catch (requestError: unknown) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to mark notification as read";

        setNotifications((currentNotifications) =>
          currentNotifications.map((notification) => {
            if (notification.id !== notificationId) {
              return notification;
            }

            return previousNotification;
          })
        );
        setIsError(true);
        setError(message);

        return false;
      }
    },
    [notifications, tenantId, userId]
  );

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.isRead).length;
  }, [notifications]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    error,
    refetch,
    markAsRead
  };
};