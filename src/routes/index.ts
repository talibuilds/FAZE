import { Router } from "express";
import authRoutes from "./auth.routes";
import walletRoutes from "./wallet.routes";
import healthRoutes from "./health.routes";
import mediaRoutes from "./media.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/wallet", walletRoutes);
router.use("/health", healthRoutes);
router.use("/media", mediaRoutes);
router.use("/user", userRoutes);

export default router;
