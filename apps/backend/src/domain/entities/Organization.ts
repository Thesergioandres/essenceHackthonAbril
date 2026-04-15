export type SubscriptionPlan = "starter" | "growth" | "enterprise";

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  isActive: boolean;
  subscriptionPlan: SubscriptionPlan;
}