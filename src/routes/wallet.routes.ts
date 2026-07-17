import { Router } from "express";
import { walletController } from "../controllers/wallet.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// All wallet routes require authentication
router.use(authenticate);

router.get("/", walletController.getWallet);
router.post("/add", walletController.addBalance);

export default router;
