import cors from "cors";
import express, { Express, NextFunction, Request, RequestHandler, Response } from "express";
import { DomainError } from "../domain/errors/DomainError";
import { DonationController } from "./http/controllers/DonationController";
import { HealthController } from "./http/controllers/HealthController";
import { createDonationRoutes } from "./http/routes/donationRoutes";
import { createHealthRoutes } from "./http/routes/healthRoutes";

interface CreateAppDependencies {
  healthController: HealthController;
  donationController: DonationController;
  tenantAuthMiddleware: RequestHandler;
}

export const createApp = ({
  healthController,
  donationController,
  tenantAuthMiddleware
}: CreateAppDependencies): Express => {
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
  app.use("/api", createDonationRoutes(donationController, tenantAuthMiddleware));

  app.use(
    (error: unknown, _request: Request, response: Response, _next: NextFunction) => {
      if (error instanceof DomainError) {
        response.status(error.statusCode).json({
          error: {
            code: error.code,
            message: error.message
          }
        });

        return;
      }

      const message =
        error instanceof Error ? error.message : "Unexpected backend error";

      response.status(500).json({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message
        }
      });
    }
  );

  return app;
};