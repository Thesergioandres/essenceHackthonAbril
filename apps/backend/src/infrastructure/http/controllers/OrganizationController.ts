import { NextFunction, Request, Response } from "express";
import {
  CreateOrganizationInput,
  CreateOrganizationUseCase
} from "../../../application/use-cases/CreateOrganizationUseCase";
import { OrganizationPlan } from "../../../domain/entities/Organization";
import { ValidationError } from "../../../domain/errors/ValidationError";

const ORGANIZATION_PLANS: OrganizationPlan[] = ["starter", "growth", "enterprise"];

interface CreateOrganizationRequestBody {
  name?: unknown;
  plan?: unknown;
  isActive?: unknown;
}

const isOrganizationPlan = (value: string): value is OrganizationPlan => {
  return ORGANIZATION_PLANS.includes(value as OrganizationPlan);
};

export class OrganizationController {
  constructor(private readonly createOrganizationUseCase: CreateOrganizationUseCase) {}

  create = async (
    request: Request<Record<string, never>, unknown, CreateOrganizationRequestBody>,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const input = this.parseInput(request.body);
      const organization = await this.createOrganizationUseCase.execute(input);
      response.status(201).json(organization);
    } catch (error: unknown) {
      next(error);
    }
  };

  private parseInput(body: CreateOrganizationRequestBody): CreateOrganizationInput {
    if (typeof body.name !== "string") {
      throw new ValidationError("name must be a string.");
    }

    if (typeof body.plan !== "string" || !isOrganizationPlan(body.plan)) {
      throw new ValidationError("plan must be one of: starter, growth, enterprise.");
    }

    if (typeof body.isActive !== "undefined" && typeof body.isActive !== "boolean") {
      throw new ValidationError("isActive must be a boolean.");
    }

    const input: CreateOrganizationInput = {
      name: body.name,
      plan: body.plan
    };

    if (typeof body.isActive === "boolean") {
      input.isActive = body.isActive;
    }

    return input;
  }
}