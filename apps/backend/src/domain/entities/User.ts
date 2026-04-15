export type UserRole = "god" | "super_admin" | "employee";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  tenantIds: string[];
}