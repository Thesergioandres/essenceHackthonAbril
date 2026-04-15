import { model, Schema, type HydratedDocument } from "mongoose";

export interface OrganizationPersistence {
  name: string;
  address: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const organizationSchema = new Schema<OrganizationPersistence>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
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