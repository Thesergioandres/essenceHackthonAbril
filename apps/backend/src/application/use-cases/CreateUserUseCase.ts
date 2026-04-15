import { IPasswordHasher } from "../contracts/IPasswordHasher";
import { User, UserProfileType, UserRole } from "../../domain/entities/User";
import { ValidationError } from "../../domain/errors/ValidationError";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

export interface CreateUserInput {
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  profileType: UserProfileType;
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const tenantId = input.tenantId.trim();
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const password = input.password.trim();

    if (tenantId.length === 0) {
      throw new ValidationError("tenantId is required.");
    }

    if (name.length === 0) {
      throw new ValidationError("name is required.");
    }

    if (email.length === 0 || !EMAIL_REGEX.test(email)) {
      throw new ValidationError("email must be valid.");
    }

    if (!PASSWORD_REGEX.test(password)) {
      throw new ValidationError(
        "password must have at least 8 characters and include at least one letter and one number."
      );
    }

    const existingUser = await this.userRepository.findByEmailForAuth(email, tenantId);

    if (existingUser) {
      throw new ValidationError("A user with this email already exists.");
    }

    const passwordHash = await this.passwordHasher.hash(password);

    return this.userRepository.create({
      tenantId,
      name,
      email,
      role: input.role,
      profileType: input.profileType,
      password_hash: passwordHash
    });
  }
}
