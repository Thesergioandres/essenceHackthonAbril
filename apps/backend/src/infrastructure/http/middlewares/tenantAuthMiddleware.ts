import { NextFunction, Request, RequestHandler, Response } from "express";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { ValidationError } from "../../../domain/errors/ValidationError";
import { IOrganizationRepository } from "../../../domain/repositories/IOrganizationRepository";

interface TenantRequestBody {
  tenantId?: unknown;
}

const resolveTenantId = (request: Request): string => {
  const fromParams = request.params.tenantId;
  const fromHeader = request.header("x-tenant-id");

  const fromQuery =
    typeof request.query.tenantId === "string" ? request.query.tenantId : undefined;

  const fromBody =
    typeof request.body === "object" && request.body !== null
      ? (request.body as TenantRequestBody).tenantId
      : undefined;

  const candidate =
    fromParams ??
    fromHeader ??
    (typeof fromBody === "string" ? fromBody : undefined) ??
    fromQuery;

  if (!candidate || candidate.trim().length === 0) {
    throw new ValidationError(
      "tenantId is required in params, body, query or x-tenant-id header."
    );
  }

  return candidate.trim();
};

export const createTenantAuthMiddleware = (
  organizationRepository: IOrganizationRepository
): RequestHandler => {
  return async (
    request: Request,
    _response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tenantId = resolveTenantId(request);
      const organization = await organizationRepository.findByTenantId(tenantId);

      if (!organization) {
        throw new NotFoundError("Tenant organization not found.");
      }

      if (!organization.isActive) {
        throw new ForbiddenError(
          "Tenant access is blocked because subscription is inactive."
        );
      }

      next();
    } catch (error: unknown) {
      next(error);
    }
  };
};