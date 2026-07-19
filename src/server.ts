import app from "./app";
import { config } from "./config";
import prisma from "./db/prisma";
import { s3Service } from "./services/s3.service";

async function main() {
  // Verify database connection
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
  }

  // Ensure S3 bucket exists
  try {
    await s3Service.ensureBucket();
    console.log("✅ S3 Bucket initialized");
  } catch (err) {
    console.error("❌ Failed to initialize S3 Bucket", err);
  }

  app.listen(config.port, "0.0.0.0", () => {
    console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║   ███████╗ █████╗ ███████╗███████╗           ║
║   ██╔════╝██╔══██╗╚══███╔╝██╔════╝           ║
║   █████╗  ███████║  ███╔╝ █████╗             ║
║   ██╔══╝  ██╔══██║ ███╔╝  ██╔══╝             ║
║   ██║     ██║  ██║███████╗███████╗           ║
║   ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝           ║
║                                              ║
║   🚀 Server running on port ${String(config.port).padEnd(5)}            ║
║   📦 Environment: ${(process.env.NODE_ENV || "development").padEnd(15)}      ║
║                                              ║
╚══════════════════════════════════════════════╝
    `);
  });
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 SIGTERM received, shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

main();
