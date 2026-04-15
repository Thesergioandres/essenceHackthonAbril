import { NextFunction, Request, Response } from "express";
import { GetSystemHealthUseCase } from "../../../application/use-cases/GetSystemHealthUseCase";

export class HealthController {
  constructor(private readonly getSystemHealthUseCase: GetSystemHealthUseCase) {}

  handle = async (
    _request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const health = await this.getSystemHealthUseCase.execute();
      const statusCode = health.status === "ok" ? 200 : 503;
      response.status(statusCode).json(health);
    } catch (error: unknown) {
      next(error);
    }
  };
}