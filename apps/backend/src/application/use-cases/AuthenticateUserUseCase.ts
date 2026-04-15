import { IPasswordHasher } from "../contracts/IPasswordHasher";
import { ITokenService } from "../contracts/ITokenService";
import { Organization } from "../../domain/entities/Organization";
import { User } from "../../domain/entities/User";
import { UnauthorizedError } from "../../domain/errors/UnauthorizedError";
import { ValidationError } from "../../domain/errors/ValidationError";
import { IOrganizationRepository } from "../../domain/repositories/IOrganizationRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVALID_CREDENTIALS_MESSAGE =
  "Credenciales inválidas, por favor verifica tus datos";

export interface AuthenticateUserInput {
  email: string;
  password: string;
  tenantId?: string;
}

export interface AuthenticateUserResponse {
  token: string;
  user: User;
  organization: Organization;
}

export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  async execute(input: AuthenticateUserInput): Promise<AuthenticateUserResponse> {
    const email = input.email.trim().toLowerCase();
    const password = input.password.trim();
    const tenantId =
      typeof input.tenantId === "string" && input.tenantId.trim().length > 0
        ? input.tenantId.trim()
        : undefined;

    if (email.length === 0 || !EMAIL_REGEX.test(email)) {
      throw new ValidationError("email must be valid.");
    }

    if (password.length === 0) {
      throw new ValidationError("password is required.");
    }

    const user = await this.userRepository.findByEmailForAuth(email, tenantId);

    if (!user || typeof user.password_hash !== "string") {
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
    }

    const passwordMatches = await this.passwordHasher.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
    }

    const organization = await this.organizationRepository.findByTenantId(user.tenantId);

    if (!organization) {
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
    }

    const token = this.tokenService.sign({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email
    });

    const safeUser: User = {
      ...user
    };
    delete safeUser.password_hash;

    return {
      token,
      user: safeUser,
      organization
    };
  }
}
