import { NextFunction, Request, Response } from "express";
import {
  CreateUserInput,
  CreateUserUseCase
} from "../../../application/use-cases/CreateUserUseCase";
import { UserProfileType, UserRole } from "../../../domain/entities/User";
import { ValidationError } from "../../../domain/errors/ValidationError";

interface CreateUserRequestBody {
  tenantId?: unknown;
  name?: unknown;
  email?: unknown;
  role?: unknown;
  profileType?: unknown;
}

const USER_ROLES: UserRole[] = [
  "god",
  "super_admin",
  "foundation",
  "employee",
  "volunteer",
  "donor"
];
const USER_PROFILE_TYPES: UserProfileType[] = ["organization", "natural_person"];

export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  register = async (
    request: Request<Record<string, never>, unknown, CreateUserRequestBody>,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tenantId = this.resolveTenantId(request, request.body);
      const input = this.parseInput(request.body, tenantId);
      const user = await this.createUserUseCase.execute(input);
      response.status(201).json(user);
    } catch (error: unknown) {
      next(error);
    }
  };

  private parseInput(body: CreateUserRequestBody, tenantId: string): CreateUserInput {
    if (typeof body.name !== "string") {
      throw new ValidationError("name must be a string.");
    }

    if (typeof body.email !== "string") {
      throw new ValidationError("email must be a string.");
    }

    if (!USER_ROLES.includes(body.role as UserRole)) {
      throw new ValidationError(
        "role must be one of god, super_admin, foundation, employee, volunteer or donor."
      );
    }

    if (!USER_PROFILE_TYPES.includes(body.profileType as UserProfileType)) {
      throw new ValidationError("profileType must be organization or natural_person.");
    }

    return {
      tenantId,
      name: body.name,
      email: body.email,
      role: body.role as UserRole,
      profileType: body.profileType as UserProfileType
    };
  }

  private resolveTenantId(
    request: Request,
    body: CreateUserRequestBody
  ): string {
    if (typeof body.tenantId === "string") {
      const bodyTenantId = body.tenantId.trim();

      if (bodyTenantId.length > 0) {
        return bodyTenantId;
      }
    }

    const headerTenantId = request.header("x-tenant-id");

    if (headerTenantId && headerTenantId.trim().length > 0) {
      return headerTenantId.trim();
    }

    throw new ValidationError("tenantId is required in body or x-tenant-id header.");
  }
}
