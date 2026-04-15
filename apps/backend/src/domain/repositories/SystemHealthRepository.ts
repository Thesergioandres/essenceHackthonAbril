export type DatabaseStatus = "connected" | "disconnected";

export interface SystemHealthRepository {
  getDatabaseStatus(): Promise<DatabaseStatus>;
}