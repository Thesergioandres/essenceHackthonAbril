import { model, Schema, type HydratedDocument } from "mongoose";

export interface ReceiptLogPersistence {
  tenantId: string;
  donationId: string;
  donorId: string;
  quantity: number;
  receivedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const receiptLogSchema = new Schema<ReceiptLogPersistence>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    donationId: {
      type: String,
      required: true,
      trim: true
    },
    donorId: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    receivedAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

receiptLogSchema.index({ tenantId: 1, receivedAt: -1 });

export type ReceiptLogDocument = HydratedDocument<ReceiptLogPersistence>;

export const ReceiptLogModel = model<ReceiptLogPersistence>(
  "ReceiptLog",
  receiptLogSchema
);
