import jwt from "jsonwebtoken";
import { AuthTokenPayload, ITokenService } from "../contracts/ITokenService";

export class JwtTokenService implements ITokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string
  ) {}

  sign(payload: AuthTokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn
    });
  }
}
