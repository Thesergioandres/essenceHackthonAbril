import { model, Schema, type HydratedDocument } from "mongoose";

export interface OrganizationLocationPersistence {
  lat: number;
  lng: number;
  addressString?: string;
}

export interface OrganizationPersistence {
  name: string;
  location: OrganizationLocationPersistence;
  createdAt?: Date;
  updatedAt?: Date;
}

const organizationLocationSchema = new Schema<OrganizationLocationPersistence>(
  {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    addressString: {
      type: String,
      required: false,
      trim: true
    }
  },
  {
    _id: false,
    id: false
  }
);

const organizationSchema = new Schema<OrganizationPersistence>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: organizationLocationSchema,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

organizationSchema.index({ "location.lat": 1, "location.lng": 1 });

export type OrganizationDocument = HydratedDocument<OrganizationPersistence>;

export const OrganizationModel = model<OrganizationPersistence>(
  "Organization",
  organizationSchema
);