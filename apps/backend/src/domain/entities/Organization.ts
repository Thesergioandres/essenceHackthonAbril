export type OrganizationPlan = "starter" | "growth" | "enterprise";

export interface Organization {
  id: string;
  name: string;
  isActive: boolean;
  plan: OrganizationPlan;
}