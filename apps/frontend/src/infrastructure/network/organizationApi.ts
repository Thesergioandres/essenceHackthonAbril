import { Organization, OrganizationLocation } from "@/domain/models/Organization";
import { httpClient } from "./httpClient";

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

export interface CreateOrganizationPayload {
  name: string;
  location: OrganizationLocation;
}

const mapOrganization = (entity: OrganizationApiEntity): Organization => {
  const lat = entity.location?.lat;
  const lng = entity.location?.lng;
  const normalizedLat = typeof lat === "number" && Number.isFinite(lat) ? lat : 0;
  const normalizedLng = typeof lng === "number" && Number.isFinite(lng) ? lng : 0;

  return {
    id: entity.id ?? entity._id ?? "",
    name: entity.name ?? "Organizacion RURA",
    location: {
      lat: normalizedLat,
      lng: normalizedLng,
      ...(typeof entity.location?.addressString === "string"
        ? { addressString: entity.location.addressString }
        : {})
    },
    createdAt: entity.createdAt ?? new Date().toISOString()
  };
};

export const createOrganization = async (
  payload: CreateOrganizationPayload
): Promise<Organization> => {
  const response = await httpClient.post<OrganizationApiEntity, CreateOrganizationPayload>(
    "/organizations",
    payload
  );

  return mapOrganization(response);
};
