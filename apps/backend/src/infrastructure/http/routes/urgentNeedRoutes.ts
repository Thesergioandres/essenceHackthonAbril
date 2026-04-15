import { RequestHandler, Router } from "express";
import { UrgentNeedController } from "../controllers/UrgentNeedController";

export const createUrgentNeedRoutes = (
  urgentNeedController: UrgentNeedController,
  tenantAuthMiddleware: RequestHandler
): Router => {
  const router = Router();

  router.use("/urgent-needs", tenantAuthMiddleware);
  router.post("/urgent-needs", urgentNeedController.create);
  router.get("/urgent-needs", urgentNeedController.listByTenant);

  return router;
};
