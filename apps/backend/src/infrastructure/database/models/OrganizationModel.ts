import { model, Schema, type HydratedDocument } from "mongoose";
import { SubscriptionPlan } from "../../../domain/entities/Organization";

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = ["starter", "growth", "enterprise"];

export interface OrganizationPersistence {
  tenantId: string;
  name: string;
  ownerId: string;
  isActive: boolean;
  subscriptionPlan: SubscriptionPlan;
}

const organizationSchema = new Schema<OrganizationPersistence>(
  {
    tenantId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    ownerId: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true
    },
    subscriptionPlan: {
      type: String,
      enum: SUBSCRIPTION_PLANS,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export type OrganizationDocument = HydratedDocument<OrganizationPersistence>;

export const OrganizationModel = model<OrganizationPersistence>(
  "Organization",
  organizationSchema
);