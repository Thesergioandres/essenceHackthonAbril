import { SystemHealth } from "@/domain/models/SystemHealth";
import { apiGet } from "./httpClient";

const isServiceStatus = (value: unknown): value is "ok" | "degraded" => {
  return value === "ok" || value === "degraded";
};

const isDatabaseStatus = (value: unknown): value is "connected" | "disconnected" => {
  return value === "connected" || value === "disconnected";
};

const parseSystemHealth = (payload: unknown): SystemHealth => {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Invalid health payload.");
  }

  const data = payload as Record<string, unknown>;
  const service = data.service;
  const status = data.status;
  const database = data.database;
  const timestamp = data.timestamp;

  if (
    service !== "backend" ||
    !isServiceStatus(status) ||
    !isDatabaseStatus(database) ||
    typeof timestamp !== "string"
  ) {
    throw new Error("Health payload does not match the expected shape.");
  }

  return {
    service,
    status,
    database,
    timestamp
  };
};

export const fetchBackendHealth = async (): Promise<SystemHealth> => {
  const payload = await apiGet<unknown>("/health");
  return parseSystemHealth(payload);
};