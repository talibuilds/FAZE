import { Request, Response } from "express";
import prisma from "../db/prisma";
import { asyncHandler } from "../utils/asyncHandler";

class HealthController {
  check = asyncHandler(async (_req: Request, res: Response) => {
    // Verify DB connectivity with a lightweight query
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });
}

export const healthController = new HealthController();
