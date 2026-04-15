import { Organization } from "../../domain/entities/Organization";
import { RepositoryError } from "../../domain/errors/RepositoryError";
import { IOrganizationRepository } from "../../domain/repositories/IOrganizationRepository";
import {
  OrganizationDocument,
  OrganizationModel
} from "../database/models/OrganizationModel";

const mapToDomain = (document: OrganizationDocument): Organization => {
  return {
    id: document.id,
    name: document.name,
    ownerId: document.ownerId,
    isActive: document.isActive,
    subscriptionPlan: document.subscriptionPlan
  };
};

export class MongoOrganizationRepository implements IOrganizationRepository {
  async findByTenantId(tenantId: string): Promise<Organization | null> {
    try {
      const organization = await OrganizationModel.findOne({ tenantId }).exec();

      if (!organization) {
        return null;
      }

      return mapToDomain(organization);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`Organization query failed: ${message}`);
    }
  }
}