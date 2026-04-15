import { ErrorRequestHandler } from "express";
import { DomainError } from "../../../domain/errors/DomainError";

const resolveStatusCode = (error: DomainError): number => {
  if (error.code === "VALIDATION_ERROR") {
    return 400;
  }

  if (error.code === "UNAUTHORIZED") {
    return 401;
  }

  if (error.code === "FORBIDDEN") {
    return 403;
  }

  if (error.code === "NOT_FOUND") {
    return 404;
  }

  return error.statusCode;
};

export const errorHandlerMiddleware: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next
): void => {
  if (error instanceof DomainError) {
    response.status(resolveStatusCode(error)).json({
      error: {
        code: error.code,
        message: error.message
      }
    });

    return;
  }

  const message = error instanceof Error ? error.message : "Unexpected backend error";

  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message
    }
  });
};