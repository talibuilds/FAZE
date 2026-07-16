import { Router } from "express";
import multer from "multer";
import { uploadMedia, getFeed, purchaseMedia, getOriginalUrl, proxyImage } from "../controllers/media.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.get("/feed", getFeed);
router.get("/proxy", proxyImage);
router.post("/upload", upload.single("image"), uploadMedia);
router.post("/:id/unlock", purchaseMedia);
router.get("/:id/original", getOriginalUrl);

export default router;
