import { Router } from "express";
import { AdminController } from "../controllers/AdminController";

export const createAdminRoutes = (adminController: AdminController): Router => {
  const router = Router();

  router.post("/admin/seed", adminController.seed);

  return router;
};
