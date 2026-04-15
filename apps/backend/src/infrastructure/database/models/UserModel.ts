import { model, Schema, type HydratedDocument } from "mongoose";
import { UserRole } from "../../../domain/entities/User";

const USER_ROLES: UserRole[] = ["god", "super_admin", "employee"];

export interface UserPersistence {
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
}

const userSchema = new Schema<UserPersistence>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export type UserDocument = HydratedDocument<UserPersistence>;

export const UserModel = model<UserPersistence>("User", userSchema);