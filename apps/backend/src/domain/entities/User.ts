export type UserRole = "god" | "super_admin" | "employee" | "donor";

export type UserProfileType = "organization" | "natural_person";

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  profileType: UserProfileType;
}