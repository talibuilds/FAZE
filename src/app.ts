import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";

const app = express();

// ── Global Middleware ────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ── API Routes ──────────────────────────────
app.use("/api", routes);

// ── 404 Handler ─────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    error: {
      message: "Route not found",
      code: "NOT_FOUND",
    },
  });
});

// ── Centralized Error Handler ───────────────
app.use(errorHandler);

export default app;
