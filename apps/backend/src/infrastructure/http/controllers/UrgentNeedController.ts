import { NextFunction, Request, Response } from "express";
import {
  CreateUrgentNeedInput,
  CreateUrgentNeedUseCase
} from "../../../application/use-cases/CreateUrgentNeedUseCase";
import { ListUrgentNeedsUseCase } from "../../../application/use-cases/ListUrgentNeedsUseCase";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";
import { ValidationError } from "../../../domain/errors/ValidationError";

interface CreateUrgentNeedRequestBody {
  description?: unknown;
}

export class UrgentNeedController {
  constructor(
    private readonly createUrgentNeedUseCase: CreateUrgentNeedUseCase,
    private readonly listUrgentNeedsUseCase: ListUrgentNeedsUseCase
  ) {}

  create = async (
    request: Request<Record<string, never>, unknown, CreateUrgentNeedRequestBody>,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tenantId = this.resolveTenantId(request);
      const input = this.parseCreateInput(request.body, tenantId);
      const urgentNeed = await this.createUrgentNeedUseCase.execute(input);
      response.status(201).json(urgentNeed);
    } catch (error: unknown) {
      next(error);
    }
  };

  listByTenant = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tenantId = this.resolveTenantId(request);
      const urgentNeeds = await this.listUrgentNeedsUseCase.execute(tenantId);
      response.status(200).json(urgentNeeds);
    } catch (error: unknown) {
      next(error);
    }
  };

  private parseCreateInput(
    body: CreateUrgentNeedRequestBody,
    tenantId: string
  ): CreateUrgentNeedInput {
    if (typeof body.description !== "string") {
      throw new ValidationError("description must be a string.");
    }

    return {
      tenantId,
      description: body.description
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
