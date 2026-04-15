import { model, Schema, type HydratedDocument } from "mongoose";
import {
  NotificationChannel,
  NotificationEventType
} from "../../../domain/entities/Notification";

const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  "foundation",
  "volunteer",
  "donor"
];

const NOTIFICATION_EVENT_TYPES: NotificationEventType[] = [
  "DONATION_AVAILABLE",
  "DONATION_REQUESTED",
  "DONATION_PICKED_UP",
  "DONATION_DELIVERED",
  "URGENT_NEED_PUBLISHED"
];

export interface NotificationPersistence {
  tenantId: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  message: string;
  recipientUserId?: string;
  donationId?: string;
  urgentNeedId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const notificationSchema = new Schema<NotificationPersistence>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    eventType: {
      type: String,
      enum: NOTIFICATION_EVENT_TYPES,
      required: true
    },
    channel: {
      type: String,
      enum: NOTIFICATION_CHANNELS,
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    recipientUserId: {
      type: String,
      required: false,
      trim: true
    },
    donationId: {
      type: String,
      required: false,
      trim: true
    },
    urgentNeedId: {
      type: String,
      required: false,
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

notificationSchema.index({ tenantId: 1, createdAt: -1 });
notificationSchema.index({ tenantId: 1, channel: 1, recipientUserId: 1 });

export type NotificationDocument = HydratedDocument<NotificationPersistence>;

export const NotificationModel = model<NotificationPersistence>(
  "Notification",
  notificationSchema
);
