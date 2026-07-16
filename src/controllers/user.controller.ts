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
          const originalUrl = await s3Service.getPresignedUrl(m.originalKey, 3600);
          const previewUrl = await s3Service.getPresignedUrl(m.previewKey, 3600);
          return {
            id: m.id,
            title: m.title,
            price: m.price,
            originalUrl,
            previewUrl,
            isUnlocked: true,
            type: isPurchased ? "purchased" : "published",
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
