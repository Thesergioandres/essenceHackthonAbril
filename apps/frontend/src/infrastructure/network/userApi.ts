import { User, UserType } from "@/domain/models/User";
import { httpClient } from "./httpClient";

type RegisterUserRole = "foundation" | "volunteer" | "donor";
type RegisterUserProfileType = "organization" | "natural_person";

interface UserApiEntity {
  id?: string;
  _id?: string;
  tenantId?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface RegisterUserPayload {
  tenantId: string;
  name: string;
  email: string;
  role: RegisterUserRole;
  profileType: RegisterUserProfileType;
}

const mapRoleToUserType = (role: unknown): UserType => {
  if (role === "foundation" || role === "volunteer" || role === "donor") {
    return role;
  }

  return "admin";
};

const mapUser = (entity: UserApiEntity, fallbackTenantId: string): User => {
  const tenantId = typeof entity.tenantId === "string" ? entity.tenantId : fallbackTenantId;

  return {
    id: entity.id ?? entity._id ?? "",
    tenantIds: [tenantId],
    name: entity.name ?? "Usuario RURA",
    email: entity.email ?? "",
    type: mapRoleToUserType(entity.role)
  };
};

export const registerUser = async (payload: RegisterUserPayload): Promise<User> => {
  const response = await httpClient.post<UserApiEntity, RegisterUserPayload>(
    "/users/register",
    payload,
    {
      tenantId: payload.tenantId
    }
  );

  return mapUser(response, payload.tenantId);
};
