export interface Donation {
  id: string;
  tenantId: string;
  donorOrganizationId: string;
  foodType: string;
  quantityKg: number;
  createdAt: Date;
}