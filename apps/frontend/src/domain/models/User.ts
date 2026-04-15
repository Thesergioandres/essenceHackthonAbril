export type UserType = "foundation" | "volunteer" | "donor" | "admin";

export interface User {
  id: string;
  tenantIds: string[];
  name: string;
  email: string;
  type: UserType;
}