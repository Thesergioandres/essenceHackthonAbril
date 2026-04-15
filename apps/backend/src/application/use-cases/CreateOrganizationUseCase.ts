import { Organization, OrganizationPlan } from "../../domain/entities/Organization";
import { ValidationError } from "../../domain/errors/ValidationError";
import { IOrganizationRepository } from "../../domain/repositories/IOrganizationRepository";

const ORGANIZATION_PLANS: OrganizationPlan[] = ["starter", "growth", "enterprise"];

export interface CreateOrganizationInput {
  name: string;
  plan: OrganizationPlan;
  isActive?: boolean;
}

const isOrganizationPlan = (value: string): value is OrganizationPlan => {
  return ORGANIZATION_PLANS.includes(value as OrganizationPlan);
};

export class CreateOrganizationUseCase {
  constructor(private readonly organizationRepository: IOrganizationRepository) {}

  async execute(input: CreateOrganizationInput): Promise<Organization> {
    const name = input.name.trim();

    if (name.length === 0) {
      throw new ValidationError("Organization name is required.");
    }

    if (!isOrganizationPlan(input.plan)) {
      throw new ValidationError("Organization plan is invalid.");
    }

    return this.organizationRepository.create({
      name,
      isActive: input.isActive ?? true,
      plan: input.plan
    });
  }
}