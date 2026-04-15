export interface Organization {
  id: string;
  tenantId: string;
  legalName: string;
  contactEmail: string;
  active: boolean;
  createdAt: Date;
}