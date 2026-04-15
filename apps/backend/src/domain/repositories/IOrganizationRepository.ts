import { Organization, OrganizationPlan } from "../entities/Organization";

export interface CreateOrganizationRecord {
  name: string;
  isActive: boolean;
  plan: OrganizationPlan;
}

export interface IOrganizationRepository {
  create(record: CreateOrganizationRecord): Promise<Organization>;
  findByTenantId(tenantId: string): Promise<Organization | null>;
}