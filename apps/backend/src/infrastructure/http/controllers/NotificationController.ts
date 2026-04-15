import { NextFunction, Request, Response } from "express";
import {
  ListNotificationsInput,
  ListNotificationsUseCase
} from "../../../application/use-cases/ListNotificationsUseCase";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError";

export class NotificationController {
  constructor(private readonly listNotificationsUseCase: ListNotificationsUseCase) {}

  list = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const input = this.parseInput(request);
      const notifications = await this.listNotificationsUseCase.execute(input);
      response.status(200).json(notifications);
    } catch (error: unknown) {
      next(error);
    }
  };

  private parseInput(request: Request): ListNotificationsInput {
    const tenantId = request.header("x-tenant-id");
    const userId = request.header("x-user-id");

    if (!tenantId || tenantId.trim().length === 0) {
      throw new UnauthorizedError("x-tenant-id header is required.");
    }

    if (!userId || userId.trim().length === 0) {
      throw new UnauthorizedError("x-user-id header is required.");
    }

    return {
      tenantId: tenantId.trim(),
      userId: userId.trim()
    };
  }
}
