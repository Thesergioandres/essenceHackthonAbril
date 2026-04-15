import { User, UserRole } from "../entities/User";

export interface CreateUserRecord {
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface IUserRepository {
  create(record: CreateUserRecord): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findByTenantId(tenantId: string): Promise<User[]>;
}