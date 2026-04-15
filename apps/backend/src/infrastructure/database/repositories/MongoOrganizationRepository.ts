import { isValidObjectId } from "mongoose";
import {
  Organization,
  OrganizationLocation
} from "../../../domain/entities/Organization";
import { RepositoryError } from "../../../domain/errors/RepositoryError";
import {
  CreateOrganizationRecord,
  IOrganizationRepository
} from "../../../domain/repositories/IOrganizationRepository";
import {
  OrganizationDocument,
  OrganizationModel
} from "../models/OrganizationModel";

const mapLocation = (document: OrganizationDocument): OrganizationLocation => {
  const normalized: OrganizationLocation = {
    lat: document.location.lat,
    lng: document.location.lng
  };

  if (typeof document.location.addressString === "string") {
    const trimmedAddress = document.location.addressString.trim();

    if (trimmedAddress.length > 0) {
      normalized.addressString = trimmedAddress;
    }
  }

  return normalized;
};

const mapOrganization = (document: OrganizationDocument): Organization => {
  return {
    id: document.id,
    name: document.name,
    location: mapLocation(document),
    createdAt:
      document.createdAt instanceof Date ? document.createdAt : new Date(0)
  };
};

export class MongoOrganizationRepository implements IOrganizationRepository {
  async create(record: CreateOrganizationRecord): Promise<Organization> {
    try {
      const organization = await OrganizationModel.create({
        name: record.name,
        location: {
          lat: record.location.lat,
          lng: record.location.lng,
          ...(record.location.addressString
            ? { addressString: record.location.addressString }
            : {})
        }
      });

      return mapOrganization(organization);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`Organization creation failed: ${message}`);
    }
  }

  async findByTenantId(tenantId: string): Promise<Organization | null> {
    try {
      if (!isValidObjectId(tenantId)) {
        return null;
      }

      const organization = await OrganizationModel.findById(tenantId).exec();

      if (!organization) {
        return null;
      }

      return mapOrganization(organization);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`Organization query failed: ${message}`);
    }
  }
}