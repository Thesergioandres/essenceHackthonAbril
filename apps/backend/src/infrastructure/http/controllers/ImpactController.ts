import { NextFunction, Request, Response } from "express";
import { GetImpactStatsUseCase } from "../../../application/use-cases/GetImpactStatsUseCase";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";

export class ImpactController {
  constructor(private readonly getImpactStatsUseCase: GetImpactStatsUseCase) {}

  getStats = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tenantId = this.resolveTenantId(request);
      const stats = await this.getImpactStatsUseCase.execute(tenantId);
      response.status(200).json(stats);
    } catch (error: unknown) {
      next(error);
    }
  };

  private resolveTenantId(request: Request): string {
    const tenantId = request.header("x-tenant-id");

    if (!tenantId || tenantId.trim().length === 0) {
      throw new UnauthorizedError("x-tenant-id header is required.");
    }

    return tenantId.trim();
  }
}
