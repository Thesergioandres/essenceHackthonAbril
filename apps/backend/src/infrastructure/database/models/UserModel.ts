import { model, Schema, type HydratedDocument } from "mongoose";
import { UserProfileType, UserRole } from "../../../domain/entities/User";

const USER_ROLES: UserRole[] = [
  "god",
  "super_admin",
  "foundation",
  "employee",
  "volunteer",
  "donor"
];
const USER_PROFILE_TYPES: UserProfileType[] = ["organization", "natural_person"];

export interface UserPersistence {
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  profileType: UserProfileType;
  penalties: number;
  password_hash: string;
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
    },
    profileType: {
      type: String,
      enum: USER_PROFILE_TYPES,
      required: true
    },
    penalties: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    password_hash: {
      type: String,
      required: true,
      select: false
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