import { Router } from "express";
import { UserController } from "../controllers/UserController";

export const createUserRoutes = (
  userController: UserController
): Router => {
  const router = Router();

  router.post("/users/register", userController.register);

  return router;
};
