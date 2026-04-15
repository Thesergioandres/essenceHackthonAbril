import { RequestHandler, Router } from "express";
import { DonationController } from "../controllers/DonationController";

export const createDonationRoutes = (
  donationController: DonationController,
  tenantAuthMiddleware: RequestHandler
): Router => {
  const router = Router();

  router.use("/donations", tenantAuthMiddleware);
  router.post("/donations", donationController.create);
  router.get("/donations", donationController.listByTenant);
  router.patch("/donations/:id/status", donationController.updateStatus);

  return router;
};