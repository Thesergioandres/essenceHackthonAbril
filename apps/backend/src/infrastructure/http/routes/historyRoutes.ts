import { RequestHandler, Router } from "express";
import { HistoryController } from "../controllers/HistoryController";

export const createHistoryRoutes = (
  historyController: HistoryController,
  tenantAuthMiddleware: RequestHandler
): Router => {
  const router = Router();

  router.use("/history", tenantAuthMiddleware);
  router.get("/history", historyController.list);

  return router;
};
