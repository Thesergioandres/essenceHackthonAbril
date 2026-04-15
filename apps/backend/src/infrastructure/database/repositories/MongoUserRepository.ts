import { User } from "../../../domain/entities/User";
import { RepositoryError } from "../../../domain/errors/RepositoryError";
import {
  CreateUserRecord,
  IUserRepository
} from "../../../domain/repositories/IUserRepository";
import { UserDocument, UserModel } from "../models/UserModel";

const mapUser = (document: UserDocument, includePasswordHash = false): User => {
  const normalizedPasswordHash =
    typeof document.password_hash === "string" ? document.password_hash.trim() : "";

  return {
    id: document.id,
    tenantId: document.tenantId,
    name: document.name,
    email: document.email,
    role: document.role,
    profileType: document.profileType,
    penalties: Number.isFinite(document.penalties) ? document.penalties : 0,
    ...(includePasswordHash && normalizedPasswordHash.length > 0
      ? { password_hash: normalizedPasswordHash }
      : {})
  };
};

export class MongoUserRepository implements IUserRepository {
  async create(record: CreateUserRecord): Promise<User> {
    try {
      const user = await UserModel.create({
        tenantId: record.tenantId,
        name: record.name,
        email: record.email,
        role: record.role,
        profileType: record.profileType,
        penalties: 0,
        password_hash: record.password_hash
      });

      return mapUser(user);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`User creation failed: ${message}`);
    }
  }

  async findById(userId: string): Promise<User | null> {
    try {
      const user = await UserModel.findById(userId).exec();

      if (!user) {
        return null;
      }

      return mapUser(user);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`User query by id failed: ${message}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ email: email.toLowerCase() }).exec();

      if (!user) {
        return null;
      }

      return mapUser(user);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`User query by email failed: ${message}`);
    }
  }

  async findByEmailForAuth(email: string, tenantId?: string): Promise<User | null> {
    try {
      const normalizedEmail = email.toLowerCase();
      const normalizedTenantId =
        typeof tenantId === "string" && tenantId.trim().length > 0
          ? tenantId.trim()
          : undefined;

      const query = normalizedTenantId
        ? { email: normalizedEmail, tenantId: normalizedTenantId }
        : { email: normalizedEmail };

      const user = await UserModel.findOne(query).select("+password_hash").exec();

      if (!user) {
        return null;
      }

      return mapUser(user, true);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`User query for auth failed: ${message}`);
    }
  }

  async findByTenantId(tenantId: string): Promise<User[]> {
    try {
      const users = await UserModel.find({ tenantId }).sort({ name: 1 }).exec();

      return users.map(mapUser);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`User query by tenant failed: ${message}`);
    }
  }

  async findByTenantAndRoles(tenantId: string, roles: User["role"][]): Promise<User[]> {
    try {
      if (roles.length === 0) {
        return [];
      }

      const users = await UserModel.find({
        tenantId,
        role: { $in: roles }
      })
        .sort({ name: 1 })
        .exec();

      return users.map(mapUser);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`User query by tenant and roles failed: ${message}`);
    }
  }

  async incrementPenalties(userId: string, amount: number): Promise<User | null> {
    try {
      if (!Number.isFinite(amount) || amount <= 0) {
        return null;
      }

      const user = await UserModel.findByIdAndUpdate(
        userId,
        {
          $inc: {
            penalties: amount
          }
        },
        {
          new: true
        }
      ).exec();

      return user ? mapUser(user) : null;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown persistence failure";

      throw new RepositoryError(`User penalty update failed: ${message}`);
    }
  }
}