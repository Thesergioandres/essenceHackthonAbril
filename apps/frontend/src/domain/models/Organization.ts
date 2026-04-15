export interface Organization {
  id: string;
  name: string;
  isActive: boolean;
}

export type Tenant = Organization;
