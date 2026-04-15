import { Router } from "express";
import { HealthController } from "../controllers/HealthController";

export const createHealthRoutes = (healthController: HealthController): Router => {
  const router = Router();

  router.get("/health", healthController.handle);

  return router;
};