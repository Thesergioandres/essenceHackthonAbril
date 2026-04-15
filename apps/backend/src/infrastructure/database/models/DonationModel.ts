import { model, Schema, type HydratedDocument } from "mongoose";
import { DonationStatus } from "../../../domain/entities/Donation";

const DONATION_STATUSES: DonationStatus[] = ["pending", "in_transit", "delivered"];

export interface DonationPersistence {
  tenantId: string;
  title: string;
  quantity: number;
  status: DonationStatus;
  expirationDate: Date;
}

const donationSchema = new Schema<DonationPersistence>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
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
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

donationSchema.index({ tenantId: 1, status: 1 });

export type DonationDocument = HydratedDocument<DonationPersistence>;

export const DonationModel = model<DonationPersistence>("Donation", donationSchema);