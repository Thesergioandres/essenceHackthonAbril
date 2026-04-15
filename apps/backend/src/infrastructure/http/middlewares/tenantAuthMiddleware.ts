import { NextFunction, Request, RequestHandler, Response } from "express";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";
import { IOrganizationRepository } from "../../../domain/repositories/IOrganizationRepository";

const resolveTenantIdFromHeader = (request: Request): string => {
  const tenantId = request.header("x-tenant-id");

  if (!tenantId || tenantId.trim().length === 0) {
    throw new ForbiddenError("x-tenant-id header is required.");
  }

  return tenantId.trim();
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
      const tenantId = resolveTenantIdFromHeader(request);
      const organization = await organizationRepository.findByTenantId(tenantId);

      if (!organization || !organization.isActive) {
        throw new ForbiddenError(
          "Tenant access is blocked because organization does not exist or is inactive."
        );
      }

      next();
    } catch (error: unknown) {
      next(error);
    }
  };
};