import { UserRole } from "../../domain/entities/User";

export const isFoundationRole = (role: UserRole): boolean => {
  return role === "foundation" || role === "super_admin" || role === "god";
};

export const isVolunteerRole = (role: UserRole): boolean => {
  return role === "volunteer" || role === "employee";
};

export const canCreateDonationsRole = (role: UserRole): boolean => {
  return role === "donor" || isFoundationRole(role);
};
