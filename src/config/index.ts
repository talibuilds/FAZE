import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  databaseUrl: process.env.DATABASE_URL!,
  bcryptRounds: 12,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
  },
} as const;

// Validate critical env vars at startup
const required = ["JWT_SECRET", "DATABASE_URL"] as const;
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}
