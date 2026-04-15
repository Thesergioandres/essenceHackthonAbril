import { model, Schema, type HydratedDocument } from "mongoose";
import { DonationStatus } from "../../../domain/entities/Donation";

const DONATION_STATUSES: DonationStatus[] = [
  "available",
  "requested",
  "picked_up",
  "delivered"
];

export interface DonationPersistence {
  tenantId: string;
  donorId: string;
  title: string;
  quantity: number;
  status: DonationStatus;
  expirationDate: Date;
  assignedAt: Date;
  reassignmentCount: number;
  requestedByTenantId?: string;
  assignedVolunteerId?: string;
  donorPhoto?: string;
  pickupPhoto?: string;
  deliveryPhoto?: string;
}

const donationSchema = new Schema<DonationPersistence>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    donorId: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    status: {
      type: String,
      enum: DONATION_STATUSES,
      required: true
    },
    expirationDate: {
      type: Date,
      required: true
    },
    assignedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    reassignmentCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    requestedByTenantId: {
      type: String,
      required: false,
      trim: true
    },
    assignedVolunteerId: {
      type: String,
      required: false,
      trim: true
    },
    donorPhoto: {
      type: String,
      required: false
    },
    pickupPhoto: {
      type: String,
      required: false
    },
    deliveryPhoto: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

donationSchema.index({ tenantId: 1, status: 1 });
donationSchema.index({ tenantId: 1, assignedVolunteerId: 1 });
donationSchema.index({ status: 1, assignedAt: 1 });

export type DonationDocument = HydratedDocument<DonationPersistence>;

export const DonationModel = model<DonationPersistence>("Donation", donationSchema);