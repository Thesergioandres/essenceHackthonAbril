import { model, Schema, type HydratedDocument } from "mongoose";
import { UrgentNeedPriority } from "../../../domain/entities/UrgentNeed";

const URGENT_NEED_PRIORITIES: UrgentNeedPriority[] = ["HIGH"];

export interface UrgentNeedPersistence {
  tenantId: string;
  description: string;
  priority: UrgentNeedPriority;
  linkedDonationId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const urgentNeedSchema = new Schema<UrgentNeedPersistence>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    priority: {
      type: String,
      enum: URGENT_NEED_PRIORITIES,
      required: true
    },
    linkedDonationId: {
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

urgentNeedSchema.index({ tenantId: 1, createdAt: -1 });

export type UrgentNeedDocument = HydratedDocument<UrgentNeedPersistence>;

export const UrgentNeedModel = model<UrgentNeedPersistence>(
  "UrgentNeed",
  urgentNeedSchema
);
