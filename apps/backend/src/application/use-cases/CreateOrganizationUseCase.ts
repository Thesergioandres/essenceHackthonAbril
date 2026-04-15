import { Organization } from "../../domain/entities/Organization";
import { ValidationError } from "../../domain/errors/ValidationError";
import { IOrganizationRepository } from "../../domain/repositories/IOrganizationRepository";

export interface CreateOrganizationInput {
  name: string;
  address: string;
}

export class CreateOrganizationUseCase {
  constructor(private readonly organizationRepository: IOrganizationRepository) {}

  async execute(input: CreateOrganizationInput): Promise<Organization> {
    const name = input.name.trim();
    const address = input.address.trim();

    if (name.length === 0) {
      throw new ValidationError("Organization name is required.");
    }

    if (address.length === 0) {
      throw new ValidationError("Organization address is required.");
    }

    return this.organizationRepository.create({
      name,
      address
    });
  }
}