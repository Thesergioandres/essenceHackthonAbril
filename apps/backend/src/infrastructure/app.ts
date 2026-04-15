import cors from "cors";
import express, { Express, Request, RequestHandler, Response } from "express";
import { DonationController } from "./http/controllers/DonationController";
import { HealthController } from "./http/controllers/HealthController";
import { OrganizationController } from "./http/controllers/OrganizationController";
import { errorHandlerMiddleware } from "./http/middlewares/errorHandlerMiddleware";
import { createDonationRoutes } from "./http/routes/donationRoutes";
import { createHealthRoutes } from "./http/routes/healthRoutes";
import { createOrganizationRoutes } from "./http/routes/organizationRoutes";

interface CreateAppDependencies {
  healthController: HealthController;
  organizationController: OrganizationController;
  donationController: DonationController;
  tenantAuthMiddleware: RequestHandler;
}

export const createApp = ({
  healthController,
  organizationController,
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
  app.use("/api", createOrganizationRoutes(organizationController));
  app.use("/api", createDonationRoutes(donationController, tenantAuthMiddleware));

  app.use(errorHandlerMiddleware);

  return app;
};