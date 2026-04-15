import { Organization, OrganizationLocation } from "../../domain/entities/Organization";
import { ValidationError } from "../../domain/errors/ValidationError";
import { IOrganizationRepository } from "../../domain/repositories/IOrganizationRepository";

export interface CreateOrganizationInput {
  name: string;
  location: OrganizationLocation;
}

const normalizeLocation = (location: OrganizationLocation): OrganizationLocation => {
  if (!Number.isFinite(location.lat) || location.lat < -90 || location.lat > 90) {
    throw new ValidationError("Organization location.lat must be a valid latitude.");
  }

  if (!Number.isFinite(location.lng) || location.lng < -180 || location.lng > 180) {
    throw new ValidationError("Organization location.lng must be a valid longitude.");
  }

  const normalized: OrganizationLocation = {
    lat: location.lat,
    lng: location.lng
  };

  if (typeof location.addressString === "string") {
    const trimmedAddress = location.addressString.trim();

    if (trimmedAddress.length > 0) {
      normalized.addressString = trimmedAddress;
    }
  }

  return normalized;
};

export class CreateOrganizationUseCase {
  constructor(private readonly organizationRepository: IOrganizationRepository) {}

  async execute(input: CreateOrganizationInput): Promise<Organization> {
    const name = input.name.trim();

    if (name.length === 0) {
      throw new ValidationError("Organization name is required.");
    }

    return this.organizationRepository.create({
      name,
      location: normalizeLocation(input.location)
    });
  }
}