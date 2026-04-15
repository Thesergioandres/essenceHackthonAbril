import { RequestHandler, Router } from "express";
import { UserController } from "../controllers/UserController";

export const createUserRoutes = (
  userController: UserController,
  tenantAuthMiddleware: RequestHandler
): Router => {
  const router = Router();

  router.use("/users", tenantAuthMiddleware);
  router.post("/users/register", userController.register);

  return router;
};
