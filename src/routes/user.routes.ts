import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

router.get("/stats", userController.getStats);
router.get("/my-property", userController.getMyProperty);
router.get("/transactions", userController.getTransactionHistory);
router.post("/check-username", userController.checkUsername);
router.put("/profile", userController.updateProfile);

export default router;
