import { Request, Response } from "express";
import { seedDatabase } from "../../config/seed";

export class AdminController {
  public seed = async (request: Request, response: Response): Promise<void> => {
    const adminSecret = process.env.ADMIN_SEED_SECRET;
    const providedSecret = request.headers["x-admin-secret"];

    if (!adminSecret || providedSecret !== adminSecret) {
      console.warn("Unauthorized seed attempt detected.");
      response.status(401).json({
        message: "Unauthorized: Invalid or missing admin secret"
      });
      return;
    }

    try {
      await seedDatabase();
      response.status(200).json({
        message: "SISTEMA RURA POBLADO Y LISTO PARA LA ACCIÓN (Railway Production Mode)",
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Internal server error";
      console.error(`Seed failed: ${message}`);
      response.status(500).json({
        message: "Seed operation failed",
        error: message
      });
    }
  };
}
