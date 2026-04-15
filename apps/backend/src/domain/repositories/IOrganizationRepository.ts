import { Organization } from "../entities/Organization";

export interface IOrganizationRepository {
  findByTenantId(tenantId: string): Promise<Organization | null>;
}