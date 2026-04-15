import { NextFunction, Request, Response } from "express";
import {
  CreateDonationInput,
  CreateDonationUseCase
} from "../../../application/use-cases/CreateDonationUseCase";
import { ListTenantDonationsUseCase } from "../../../application/use-cases/ListTenantDonationsUseCase";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";
import { ValidationError } from "../../../domain/errors/ValidationError";

interface CreateDonationRequestBody {
  title?: unknown;
  quantity?: unknown;
  expirationDate?: unknown;
}

export class DonationController {
  constructor(
    private readonly createDonationUseCase: CreateDonationUseCase,
    private readonly listTenantDonationsUseCase: ListTenantDonationsUseCase
  ) {}

  create = async (
    request: Request<Record<string, never>, unknown, CreateDonationRequestBody>,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const input = this.attachTenantId(
        request,
        this.parseCreateDonationInput(request.body)
      );
      const donation = await this.createDonationUseCase.execute(input);
      response.status(201).json(donation);
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
      const donations = await this.listTenantDonationsUseCase.execute(tenantId);
      response.status(200).json(donations);
    } catch (error: unknown) {
      next(error);
    }
  };

  private parseCreateDonationInput(body: CreateDonationRequestBody): CreateDonationInput {
    if (typeof body.title !== "string") {
      throw new ValidationError("title must be a string.");
    }

    if (typeof body.quantity !== "number") {
      throw new ValidationError("quantity must be a number.");
    }

    const expirationDate = this.parseExpirationDate(body.expirationDate);

    return {
      tenantId: "",
      title: body.title,
      quantity: body.quantity,
      expirationDate
    };
  }

  private resolveTenantId(request: Request): string {
    const tenantId = request.header("x-tenant-id");

    if (!tenantId || tenantId.trim().length === 0) {
      throw new ForbiddenError("x-tenant-id header is required.");
    }

    return tenantId.trim();
  }

  private parseExpirationDate(value: unknown): Date {
    if (typeof value !== "string" && !(value instanceof Date)) {
      throw new ValidationError("expirationDate must be a valid date string.");
    }

    const parsedDate = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new ValidationError("expirationDate must be a valid date.");
    }

    return parsedDate;
  }

  private attachTenantId(
    request: Request,
    input: CreateDonationInput
  ): CreateDonationInput {
    return {
      ...input,
      tenantId: this.resolveTenantId(request)
    };
  }
}