import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import { HealthController } from "./http/controllers/HealthController";
import { createHealthRoutes } from "./http/routes/healthRoutes";

export const createApp = (healthController: HealthController): Express => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/", (_request: Request, response: Response) => {
    response.status(200).json({
      service: "backend",
      message: "RURA backend online"
    });
  });

  app.use("/api", createHealthRoutes(healthController));

  app.use(
    (error: unknown, _request: Request, response: Response, _next: NextFunction) => {
      const message =
        error instanceof Error ? error.message : "Unexpected backend error";

      response.status(500).json({ message });
    }
  );

  return app;
};