import { NextFunction, Request, Response } from "express";
import {
  AuthenticateUserInput,
  AuthenticateUserUseCase
} from "../../../application/use-cases/AuthenticateUserUseCase";
import { ValidationError } from "../../../domain/errors/ValidationError";

interface LoginRequestBody {
  email?: unknown;
  password?: unknown;
  tenantId?: unknown;
}

export class AuthController {
  constructor(private readonly authenticateUserUseCase: AuthenticateUserUseCase) {}

  login = async (
    request: Request<Record<string, never>, unknown, LoginRequestBody>,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const input = this.parseLoginInput(request.body);
      const session = await this.authenticateUserUseCase.execute(input);
      response.status(200).json(session);
    } catch (error: unknown) {
      next(error);
    }
  };

  private parseLoginInput(body: LoginRequestBody): AuthenticateUserInput {
    if (typeof body.email !== "string") {
      throw new ValidationError("email must be a string.");
    }

    if (typeof body.password !== "string") {
      throw new ValidationError("password must be a string.");
    }

    if (typeof body.tenantId !== "undefined" && typeof body.tenantId !== "string") {
      throw new ValidationError("tenantId must be a string.");
    }

    return {
      email: body.email,
      password: body.password,
      ...(typeof body.tenantId === "string" ? { tenantId: body.tenantId } : {})
    };
  }
}
