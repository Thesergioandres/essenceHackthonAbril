import {
  DatabaseStatus,
  SystemHealthRepository
} from "../../domain/repositories/SystemHealthRepository";
import { isMongoDbConnected } from "../config/mongo/mongooseConnection";

export class MongooseSystemHealthRepository implements SystemHealthRepository {
  async getDatabaseStatus(): Promise<DatabaseStatus> {
    return isMongoDbConnected() ? "connected" : "disconnected";
  }
}