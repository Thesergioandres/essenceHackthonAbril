import { User, UserProfileType, UserRole } from "../entities/User";

export interface CreateUserRecord {
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  profileType: UserProfileType;
  password_hash: string;
}

export interface IUserRepository {
  create(record: CreateUserRecord): Promise<User>;
  findById(userId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailForAuth(email: string, tenantId?: string): Promise<User | null>;
  findByTenantId(tenantId: string): Promise<User[]>;
  findByTenantAndRoles(tenantId: string, roles: UserRole[]): Promise<User[]>;
  incrementPenalties(userId: string, amount: number): Promise<User | null>;
}