import { model, Schema, type HydratedDocument } from "mongoose";
import { UserRole } from "../../../domain/entities/User";

const USER_ROLES: UserRole[] = ["god", "super_admin", "employee"];

export interface UserPersistence {
  tenantId: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  tenantIds: string[];
}

const userSchema = new Schema<UserPersistence>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true
    },
    tenantIds: {
      type: [String],
      required: true,
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userSchema.index({ tenantIds: 1 });

export type UserDocument = HydratedDocument<UserPersistence>;

export const UserModel = model<UserPersistence>("User", userSchema);