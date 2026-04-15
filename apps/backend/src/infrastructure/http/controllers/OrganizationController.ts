import { NextFunction, Request, Response } from "express";
import {
  CreateOrganizationInput,
  CreateOrganizationUseCase
} from "../../../application/use-cases/CreateOrganizationUseCase";
import { ValidationError } from "../../../domain/errors/ValidationError";

interface CreateOrganizationLocationRequestBody {
  lat?: unknown;
  lng?: unknown;
  addressString?: unknown;
}

interface CreateOrganizationRequestBody {
  name?: unknown;
  location?: unknown;
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

    if (typeof body.location !== "object" || body.location === null) {
      throw new ValidationError("location must be an object.");
    }

    const rawLocation = body.location as CreateOrganizationLocationRequestBody;

    if (typeof rawLocation.lat !== "number") {
      throw new ValidationError("location.lat must be a number.");
    }

    if (typeof rawLocation.lng !== "number") {
      throw new ValidationError("location.lng must be a number.");
    }

    if (
      typeof rawLocation.addressString !== "undefined" &&
      typeof rawLocation.addressString !== "string"
    ) {
      throw new ValidationError("location.addressString must be a string.");
    }

    const location: CreateOrganizationInput["location"] = {
      lat: rawLocation.lat,
      lng: rawLocation.lng
    };

    if (typeof rawLocation.addressString === "string") {
      const trimmedAddress = rawLocation.addressString.trim();

      if (trimmedAddress.length > 0) {
        location.addressString = trimmedAddress;
      }
    }

    return {
      name: body.name,
      location
    };
  }
}