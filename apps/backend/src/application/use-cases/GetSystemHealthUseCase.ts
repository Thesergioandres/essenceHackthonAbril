export interface SystemHealthResponse {
  service: "backend";
  status: "ok";
  uptimeSeconds: number;
  timestamp: string;
}

export class GetSystemHealthUseCase {
  async execute(): Promise<SystemHealthResponse> {
    const uptimeSeconds = Math.floor(process.uptime());

    return {
      service: "backend",
      status: "ok",
      uptimeSeconds,
      timestamp: new Date().toISOString()
    };
  }
}