import { DomainError } from "./DomainError";

export class RepositoryError extends DomainError {
  constructor(message: string) {
    super(message, "REPOSITORY_ERROR", 500);
  }
}