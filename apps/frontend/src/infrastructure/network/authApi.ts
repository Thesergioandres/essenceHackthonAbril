import { Organization } from "@/domain/models/Organization";
import { User, UserType } from "@/domain/models/User";
import { httpClient } from "./httpClient";

interface UserApiEntity {
  id?: string;
  _id?: string;
  tenantId?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface OrganizationApiEntity {
  id?: string;
  _id?: string;
  name?: string;
  location?: {
    lat?: number;
    lng?: number;
    addressString?: string;
  };
  createdAt?: string;
}

interface LoginApiResponse {
  token?: string;
  user?: UserApiEntity;
  organization?: OrganizationApiEntity;
}

export interface LoginPayload {
  email: string;
  password: string;
  tenantId?: string;
}

export interface LoginSession {
  token: string;
  user: User;
  organization: Organization;
}

const mapRoleToUserType = (role: unknown): UserType => {
  if (role === "foundation" || role === "volunteer" || role === "donor") {
    return role;
  }

  return "admin";
};

const mapUser = (entity: UserApiEntity): User => {
  const tenantId = typeof entity.tenantId === "string" ? entity.tenantId : "";

  return {
    id: entity.id ?? entity._id ?? "",
    tenantIds: tenantId.length > 0 ? [tenantId] : [],
    name: entity.name ?? "Usuario RURA",
    email: entity.email ?? "",
    type: mapRoleToUserType(entity.role)
  };
};

const mapOrganization = (entity: OrganizationApiEntity): Organization => {
  const lat = entity.location?.lat;
  const lng = entity.location?.lng;

  return {
    id: entity.id ?? entity._id ?? "",
    name: entity.name ?? "Organizacion RURA",
    location: {
      lat: typeof lat === "number" && Number.isFinite(lat) ? lat : 0,
      lng: typeof lng === "number" && Number.isFinite(lng) ? lng : 0,
      ...(typeof entity.location?.addressString === "string"
        ? { addressString: entity.location.addressString }
        : {})
    },
    createdAt: entity.createdAt ?? new Date().toISOString()
  };
};

export const login = async (payload: LoginPayload): Promise<LoginSession> => {
  const response = await httpClient.post<LoginApiResponse, LoginPayload>(
    "/auth/login",
    payload,
    {
      tenantId: payload.tenantId ?? ""
    }
  );

  const token = typeof response.token === "string" ? response.token : "";

  if (token.length === 0 || !response.user || !response.organization) {
    throw new Error("La sesion recibida del backend es invalida.");
  }

  return {
    token,
    user: mapUser(response.user),
    organization: mapOrganization(response.organization)
  };
};
