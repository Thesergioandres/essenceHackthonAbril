export type ServiceStatus = "ok" | "degraded";
export type DatabaseStatus = "connected" | "disconnected";

export interface SystemHealth {
  service: "backend";
  status: ServiceStatus;
  database: DatabaseStatus;
  timestamp: string;
}