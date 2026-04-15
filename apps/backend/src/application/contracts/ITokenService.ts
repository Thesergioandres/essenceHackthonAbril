import { UserRole } from "../../domain/entities/User";

export interface AuthTokenPayload {
  userId: string;
  tenantId: string;
  role: UserRole;
  email: string;
}

export interface ITokenService {
  sign(payload: AuthTokenPayload): string;
}
