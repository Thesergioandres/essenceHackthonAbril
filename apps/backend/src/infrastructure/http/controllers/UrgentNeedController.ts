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
  title?: unknown;
  details?: unknown;
  linkedDonationId?: unknown;
  donationId?: unknown;
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
    const description = this.parseDescription(body);
    const linkedDonationId = this.parseLinkedDonationId(
      body.linkedDonationId ?? body.donationId
    );

    return {
      tenantId,
      description,
      ...(linkedDonationId ? { linkedDonationId } : {})
    };
  }

  private parseDescription(body: CreateUrgentNeedRequestBody): string {
    if (typeof body.description === "string") {
      const normalizedDescription = body.description.trim();

      if (normalizedDescription.length > 0) {
        return normalizedDescription;
      }
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const details = typeof body.details === "string" ? body.details.trim() : "";
    const fallbackDescription = [title, details]
      .filter((value) => value.length > 0)
      .join(" - ");

    if (fallbackDescription.length > 0) {
      return fallbackDescription;
    }

    throw new ValidationError(
      "description is required. You can send description directly or provide title/details."
    );
  }

  private parseLinkedDonationId(value: unknown): string | undefined {
    if (typeof value === "undefined") {
      return undefined;
    }

    if (typeof value !== "string") {
      throw new ValidationError("linkedDonationId must be a string.");
    }

    const normalizedLinkedDonationId = value.trim();
    return normalizedLinkedDonationId.length > 0 ? normalizedLinkedDonationId : undefined;
  }

  private resolveTenantId(request: Request): string {
    const tenantId = request.header("x-tenant-id");

    if (!tenantId || tenantId.trim().length === 0) {
      throw new UnauthorizedError("x-tenant-id header is required.");
    }

    return tenantId.trim();
  }
}
