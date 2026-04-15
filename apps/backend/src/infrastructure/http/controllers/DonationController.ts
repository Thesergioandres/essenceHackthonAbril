import { NextFunction, Request, Response } from "express";
import {
  CreateDonationInput,
  CreateDonationUseCase
} from "../../../application/use-cases/CreateDonationUseCase";
import { ListTenantDonationsUseCase } from "../../../application/use-cases/ListTenantDonationsUseCase";
import {
  UpdateDonationStatusInput,
  UpdateDonationStatusUseCase
} from "../../../application/use-cases/UpdateDonationStatusUseCase";
import { DonationStatusUpdate } from "../../../domain/repositories/IDonationRepository";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";
import { ValidationError } from "../../../domain/errors/ValidationError";

interface CreateDonationRequestBody {
  title?: unknown;
  quantity?: unknown;
  expirationDate?: unknown;
  donorPhoto?: unknown;
}

interface UpdateDonationStatusRequestBody {
  status?: unknown;
  photo?: unknown;
}

interface DonationRouteParams {
  [key: string]: string;
  id: string;
}

export class DonationController {
  constructor(
    private readonly createDonationUseCase: CreateDonationUseCase,
    private readonly listTenantDonationsUseCase: ListTenantDonationsUseCase,
    private readonly updateDonationStatusUseCase: UpdateDonationStatusUseCase
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

  updateStatus = async (
    request: Request<DonationRouteParams, unknown, UpdateDonationStatusRequestBody>,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const input = this.parseUpdateDonationStatusInput(
        request.params,
        request.body,
        this.resolveTenantId(request)
      );
      const donation = await this.updateDonationStatusUseCase.execute(input);
      response.status(200).json(donation);
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
    const donorPhoto = this.parseOptionalPhoto(body.donorPhoto, "donorPhoto");

    return {
      tenantId: "",
      title: body.title,
      quantity: body.quantity,
      expirationDate,
      ...(donorPhoto ? { donorPhoto } : {})
    };
  }

  private parseUpdateDonationStatusInput(
    params: DonationRouteParams,
    body: UpdateDonationStatusRequestBody,
    tenantId: string
  ): UpdateDonationStatusInput {
    if (typeof params.id !== "string") {
      throw new ValidationError("id param is required.");
    }

    const donationId = params.id.trim();

    if (donationId.length === 0) {
      throw new ValidationError("id param is required.");
    }

    const status = this.parseStatus(body.status);
    const photo = this.parseRequiredPhoto(body.photo);

    return {
      donationId,
      tenantId,
      status,
      photo
    };
  }

  private parseStatus(value: unknown): DonationStatusUpdate {
    if (value === "in_transit" || value === "delivered") {
      return value;
    }

    throw new ValidationError("status must be in_transit or delivered.");
  }

  private parseRequiredPhoto(value: unknown): string {
    if (typeof value !== "string") {
      throw new ValidationError("photo must be a string.");
    }

    const trimmedPhoto = value.trim();

    if (trimmedPhoto.length === 0) {
      throw new ValidationError("photo is required.");
    }

    return trimmedPhoto;
  }

  private parseOptionalPhoto(value: unknown, fieldName: string): string | undefined {
    if (typeof value === "undefined") {
      return undefined;
    }

    if (typeof value !== "string") {
      throw new ValidationError(`${fieldName} must be a string.`);
    }

    const trimmedPhoto = value.trim();

    return trimmedPhoto.length > 0 ? trimmedPhoto : undefined;
  }

  private resolveTenantId(request: Request): string {
    const tenantId = request.header("x-tenant-id");

    if (!tenantId || tenantId.trim().length === 0) {
      throw new UnauthorizedError("x-tenant-id header is required.");
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