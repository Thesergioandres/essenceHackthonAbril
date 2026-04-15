import { RequestHandler, Router } from "express";
import { ImpactController } from "../controllers/ImpactController";

export const createImpactRoutes = (
  impactController: ImpactController,
  tenantAuthMiddleware: RequestHandler
): Router => {
  const router = Router();

  router.use("/impact", tenantAuthMiddleware);
  router.get("/impact/stats", impactController.getStats);

  return router;
};
