import { Router } from "express";
import { OrganizationController } from "../controllers/OrganizationController";

export const createOrganizationRoutes = (
  organizationController: OrganizationController
): Router => {
  const router = Router();

  router.post("/organizations", organizationController.create);

  return router;
};