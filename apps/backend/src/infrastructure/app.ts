import cors from "cors";
import express, { Express, Request, RequestHandler, Response } from "express";
import { AdminController } from "./http/controllers/AdminController";
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
import { createAdminRoutes } from "./http/routes/adminRoutes";
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
  adminController: AdminController;
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
  adminController,
  tenantAuthMiddleware
}: CreateAppDependencies): Express => {
  const app = express();
  const allowedOrigins = new Set(env.corsAllowedOrigins);
  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      // If we are in development, allow localhost/127.0.0.1 even if not explicitly in env
      if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "content-type",
      "authorization",
      "x-tenant-id",
      "x-user-id",
      "x-user-type",
      "x-user-role"
    ],
    maxAge: 86400
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
  app.use("/api", createAdminRoutes(adminController));

  app.use(errorHandlerMiddleware);

  return app;
};