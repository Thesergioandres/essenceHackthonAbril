import bcrypt from "bcryptjs";
import { IPasswordHasher } from "../contracts/IPasswordHasher";

const SALT_ROUNDS = 12;

export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(rawPassword: string): Promise<string> {
    return bcrypt.hash(rawPassword, SALT_ROUNDS);
  }

  async compare(rawPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, passwordHash);
  }
}
