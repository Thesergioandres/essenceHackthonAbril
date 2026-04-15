import jwt, { type SignOptions } from "jsonwebtoken";
import { AuthTokenPayload, ITokenService } from "../contracts/ITokenService";

export class JwtTokenService implements ITokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string
  ) {}

  sign(payload: AuthTokenPayload): string {
    const expiresIn = this.expiresIn as NonNullable<SignOptions["expiresIn"]>;

    return jwt.sign(payload, this.secret, {
      expiresIn
    });
  }
}
