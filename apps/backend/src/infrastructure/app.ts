import cors from "cors";
import express, { Express, Request, RequestHandler, Response } from "express";
import { AuthController } from "./http/controllers/AuthController";
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
import { createAuthRoutes } from "./http/routes/authRoutes";
import { createHealthRoutes } from "./http/routes/healthRoutes";
import { createHistoryRoutes } from "./http/routes/historyRoutes";
import { createImpactRoutes } from "./http/routes/impactRoutes";
import { createNotificationRoutes } from "./http/routes/notificationRoutes";
import { createOrganizationRoutes } from "./http/routes/organizationRoutes";
import { createUrgentNeedRoutes } from "./http/routes/urgentNeedRoutes";
import { createUserRoutes } from "./http/routes/userRoutes";
import { env } from "./config/env";

interface CreateAppDependencies {
  healthController: HealthController;
  authController: AuthController;
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
  authController,
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
  const allowedOrigins = new Set(env.corsAllowedOrigins);
  const corsOptions: cors.CorsOptions = {
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    }
  };

  app.use(cors(corsOptions));
  app.use(express.json({ limit: "12mb" }));

  app.get("/", (_request: Request, response: Response) => {
    response.status(200).json({
      service: "backend",
      message: "RURA backend online"
    });
  });

  app.use("/api", createHealthRoutes(healthController));
  app.use("/api", createAuthRoutes(authController));
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