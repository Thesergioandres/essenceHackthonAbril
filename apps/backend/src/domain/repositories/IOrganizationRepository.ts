import { Organization, OrganizationLocation } from "../entities/Organization";

export interface CreateOrganizationRecord {
  name: string;
  location: OrganizationLocation;
}

export interface IOrganizationRepository {
  create(record: CreateOrganizationRecord): Promise<Organization>;
  findByTenantId(tenantId: string): Promise<Organization | null>;
}