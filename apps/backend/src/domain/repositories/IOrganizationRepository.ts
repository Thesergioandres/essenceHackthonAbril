import { Organization } from "../entities/Organization";

export interface CreateOrganizationRecord {
  name: string;
  address: string;
}

export interface IOrganizationRepository {
  create(record: CreateOrganizationRecord): Promise<Organization>;
  findByTenantId(tenantId: string): Promise<Organization | null>;
}