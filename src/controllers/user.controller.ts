import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../db/prisma";
import { s3Service } from "../services/s3.service";

class UserController {
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const totalPublished = await prisma.media.count({
      where: { ownerId: userId },
    });

    const totalPurchased = await prisma.purchase.count({
      where: { userId },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, walletBalance: true },
    });

    res.status(200).json({
      data: {
        totalPublished,
        totalPurchased,
        walletBalance: user?.walletBalance || 0,
        name: user?.name || "User",
      },
    });
  });

  getMyProperty = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    // Fetch published media
    const published = await prisma.media.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        purchases: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    // Fetch purchased media
    const purchases = await prisma.purchase.findMany({
      where: { userId },
      include: { media: true },
      orderBy: { createdAt: "desc" },
    });

    // We only need the preview/original presigned URLs depending on access.
    // For "my-property", they have access to original for both!
    const processMedia = async (mediaList: any[], isPurchased: boolean) => {
      return Promise.all(
        mediaList.map(async (m) => {
          const originalUrl = `${process.env.API_BASE_URL || 'https://faze-backend.onrender.com'}/api/media/proxy?key=${encodeURIComponent(m.originalKey)}&v=2`;
          const previewUrl = `${process.env.API_BASE_URL || 'https://faze-backend.onrender.com'}/api/media/proxy?key=${encodeURIComponent(m.previewKey)}&v=2`;
          
          const totalCollected = m.purchases ? m.purchases.reduce((acc: number, p: any) => acc + p.amountPaid, 0) : 0;
          const buyers = m.purchases ? m.purchases.map((p: any) => p.user.name || p.user.email.split('@')[0]) : [];

          return {
            id: m.id,
            title: m.title,
            price: m.price,
            originalUrl,
            previewUrl,
            isUnlocked: true,
            type: isPurchased ? "purchased" : "published",
            totalCollected,
            buyers,
          };
        })
      );
    };

    const publishedWithUrls = await processMedia(published, false);
    const purchasedWithUrls = await processMedia(purchases.map(p => p.media), true);

    res.status(200).json({
      data: {
        published: publishedWithUrls,
        purchased: purchasedWithUrls,
      },
    });
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: { message: "Name is required and must be a string" } });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
      select: { id: true, name: true, email: true, walletBalance: true }
    });

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  });
}

export const userController = new UserController();
