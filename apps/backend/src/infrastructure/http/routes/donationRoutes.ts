import { RequestHandler, Router } from "express";
import { DonationController } from "../controllers/DonationController";

export const createDonationRoutes = (
  donationController: DonationController,
  tenantAuthMiddleware: RequestHandler
): Router => {
  const router = Router();

  router.post("/donations", tenantAuthMiddleware, donationController.create);
  router.get(
    "/tenants/:tenantId/donations",
    tenantAuthMiddleware,
    donationController.listByTenant
  );

  return router;
};