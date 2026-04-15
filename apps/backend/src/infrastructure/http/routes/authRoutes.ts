import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  router.post("/auth/login", authController.login);

  return router;
};
