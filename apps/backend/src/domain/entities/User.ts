export type UserRole =
  | "god"
  | "super_admin"
  | "foundation"
  | "employee"
  | "volunteer"
  | "donor";

export type UserProfileType = "organization" | "natural_person";

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  profileType: UserProfileType;
  penalties: number;
  password_hash?: string;
}