import { model, Schema, type HydratedDocument } from "mongoose";
import { OrganizationPlan } from "../../../domain/entities/Organization";

const ORGANIZATION_PLANS: OrganizationPlan[] = ["starter", "growth", "enterprise"];

export interface OrganizationPersistence {
  name: string;
  isActive: boolean;
  plan: OrganizationPlan;
}

const organizationSchema = new Schema<OrganizationPersistence>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true
    },
    plan: {
      type: String,
      enum: ORGANIZATION_PLANS,
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