import { NextFunction, Request, Response } from "express";
import {
  CreateOrganizationInput,
  CreateOrganizationUseCase
} from "../../../application/use-cases/CreateOrganizationUseCase";
import { ValidationError } from "../../../domain/errors/ValidationError";

interface CreateOrganizationRequestBody {
  name?: unknown;
  address?: unknown;
}

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

    if (typeof body.address !== "string") {
      throw new ValidationError("address must be a string.");
    }

    return {
      name: body.name,
      address: body.address
    };
  }
}