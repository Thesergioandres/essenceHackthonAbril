import { DomainError } from "./DomainError";

export class UnauthorizedError extends DomainError {
  constructor(message: string) {
    super(message, "UNAUTHORIZED", 401);
  }
}