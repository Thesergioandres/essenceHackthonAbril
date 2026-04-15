import { RequestHandler, Router } from "express";
import { NotificationController } from "../controllers/NotificationController";

export const createNotificationRoutes = (
  notificationController: NotificationController,
  tenantAuthMiddleware: RequestHandler
): Router => {
  const router = Router();

  router.use("/notifications", tenantAuthMiddleware);
  router.get("/notifications", notificationController.list);

  return router;
};
