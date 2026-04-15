export type UserRole = "god" | "super_admin" | "employee";

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
}