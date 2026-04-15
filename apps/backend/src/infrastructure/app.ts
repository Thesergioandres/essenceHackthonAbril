import cors from "cors";
import express, { Express, Request, RequestHandler, Response } from "express";
import { DonationController } from "./http/controllers/DonationController";
import { HealthController } from "./http/controllers/HealthController";
import { HistoryController } from "./http/controllers/HistoryController";
import { ImpactController } from "./http/controllers/ImpactController";
import { NotificationController } from "./http/controllers/NotificationController";
import { OrganizationController } from "./http/controllers/OrganizationController";
import { UrgentNeedController } from "./http/controllers/UrgentNeedController";
import { UserController } from "./http/controllers/UserController";
import { errorHandlerMiddleware } from "./http/middlewares/errorHandlerMiddleware";
import { createDonationRoutes } from "./http/routes/donationRoutes";
import { createHealthRoutes } from "./http/routes/healthRoutes";
import { createHistoryRoutes } from "./http/routes/historyRoutes";
import { createImpactRoutes } from "./http/routes/impactRoutes";
import { createNotificationRoutes } from "./http/routes/notificationRoutes";
import { createOrganizationRoutes } from "./http/routes/organizationRoutes";
import { createUrgentNeedRoutes } from "./http/routes/urgentNeedRoutes";
import { createUserRoutes } from "./http/routes/userRoutes";

interface CreateAppDependencies {
  healthController: HealthController;
  organizationController: OrganizationController;
  donationController: DonationController;
  urgentNeedController: UrgentNeedController;
  notificationController: NotificationController;
  historyController: HistoryController;
  impactController: ImpactController;
  userController: UserController;
  tenantAuthMiddleware: RequestHandler;
}

export const createApp = ({
  healthController,
  organizationController,
  donationController,
  urgentNeedController,
  notificationController,
  historyController,
  impactController,
  userController,
  tenantAuthMiddleware
}: CreateAppDependencies): Express => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "12mb" }));

  app.get("/", (_request: Request, response: Response) => {
    response.status(200).json({
      service: "backend",
      message: "RURA backend online"
    });
  });

  app.use("/api", createHealthRoutes(healthController));
  app.use("/api", createOrganizationRoutes(organizationController));
  app.use("/api", createUserRoutes(userController));
  app.use("/api", createDonationRoutes(donationController, tenantAuthMiddleware));
  app.use("/api", createUrgentNeedRoutes(urgentNeedController, tenantAuthMiddleware));
  app.use("/api", createNotificationRoutes(notificationController, tenantAuthMiddleware));
  app.use("/api", createHistoryRoutes(historyController, tenantAuthMiddleware));
  app.use("/api", createImpactRoutes(impactController, tenantAuthMiddleware));

  app.use(errorHandlerMiddleware);

  return app;
};