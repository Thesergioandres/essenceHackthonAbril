import {
  DatabaseStatus,
  SystemHealthRepository
} from "../../domain/repositories/SystemHealthRepository";

export interface SystemHealthResponse {
  service: "backend";
  status: "ok" | "degraded";
  database: DatabaseStatus;
  timestamp: string;
}

export class GetSystemHealthUseCase {
  constructor(private readonly healthRepository: SystemHealthRepository) {}

  async execute(): Promise<SystemHealthResponse> {
    const database = await this.healthRepository.getDatabaseStatus();

    return {
      service: "backend",
      status: database === "connected" ? "ok" : "degraded",
      database,
      timestamp: new Date().toISOString()
    };
  }
}