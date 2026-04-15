import { NextFunction, Request, Response } from "express";
import {
  CreateUserInput,
  CreateUserUseCase
} from "../../../application/use-cases/CreateUserUseCase";
import { UserProfileType, UserRole } from "../../../domain/entities/User";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";
import { ValidationError } from "../../../domain/errors/ValidationError";

interface CreateUserRequestBody {
  name?: unknown;
  email?: unknown;
  role?: unknown;
  profileType?: unknown;
}

const USER_ROLES: UserRole[] = ["god", "super_admin", "employee", "donor"];
const USER_PROFILE_TYPES: UserProfileType[] = ["organization", "natural_person"];

export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  register = async (
    request: Request<Record<string, never>, unknown, CreateUserRequestBody>,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tenantId = this.resolveTenantId(request);
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
      throw new ValidationError("role must be one of god, super_admin, employee or donor.");
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

  private resolveTenantId(request: Request): string {
    const tenantId = request.header("x-tenant-id");

    if (!tenantId || tenantId.trim().length === 0) {
      throw new UnauthorizedError("x-tenant-id header is required.");
    }

    return tenantId.trim();
  }
}
