import { NextFunction, Request, RequestHandler, Response } from "express";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";
import { IOrganizationRepository } from "../../../domain/repositories/IOrganizationRepository";

const resolveTenantIdFromHeader = (request: Request): string => {
  const tenantId = request.header("x-tenant-id");

  if (!tenantId || tenantId.trim().length === 0) {
    throw new UnauthorizedError("x-tenant-id header is required.");
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

      if (!organization) {
        throw new NotFoundError("Tenant organization not found.");
      }

      next();
    } catch (error: unknown) {
      next(error);
    }
  };
};