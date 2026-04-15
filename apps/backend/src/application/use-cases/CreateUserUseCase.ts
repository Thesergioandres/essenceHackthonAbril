import { User, UserProfileType, UserRole } from "../../domain/entities/User";
import { ValidationError } from "../../domain/errors/ValidationError";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

export interface CreateUserInput {
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  profileType: UserProfileType;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    const tenantId = input.tenantId.trim();
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();

    if (tenantId.length === 0) {
      throw new ValidationError("tenantId is required.");
    }

    if (name.length === 0) {
      throw new ValidationError("name is required.");
    }

    if (email.length === 0 || !EMAIL_REGEX.test(email)) {
      throw new ValidationError("email must be valid.");
    }

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ValidationError("A user with this email already exists.");
    }

    return this.userRepository.create({
      tenantId,
      name,
      email,
      role: input.role,
      profileType: input.profileType
    });
  }
}
