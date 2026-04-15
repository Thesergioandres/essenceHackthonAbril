import { isValidObjectId } from "mongoose";
import { Organization } from "../../../domain/entities/Organization";
import { RepositoryError } from "../../../domain/errors/RepositoryError";
import {
  CreateOrganizationRecord,
  IOrganizationRepository
} from "../../../domain/repositories/IOrganizationRepository";
import {
  OrganizationDocument,
  OrganizationModel
} from "../models/OrganizationModel";

const mapOrganization = (document: OrganizationDocument): Organization => {
  return {
    id: document.id,
    name: document.name,
    address: document.address,
    createdAt:
      document.createdAt instanceof Date ? document.createdAt : new Date(0)
  };
};

export class MongoOrganizationRepository implements IOrganizationRepository {
  async create(record: CreateOrganizationRecord): Promise<Organization> {
    try {
      const organization = await OrganizationModel.create({
        name: record.name,
        address: record.address
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