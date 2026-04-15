import { NextFunction, Request, Response } from "express";
import { ListReceiptHistoryUseCase } from "../../../application/use-cases/ListReceiptHistoryUseCase";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";

export class HistoryController {
  constructor(private readonly listReceiptHistoryUseCase: ListReceiptHistoryUseCase) {}

  list = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tenantId = this.resolveTenantId(request);
      const history = await this.listReceiptHistoryUseCase.execute(tenantId);
      response.status(200).json(history);
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
