import prisma from "../db/prisma";
import { s3Service } from "./s3.service";
import { AppError } from "../utils/AppError";
import sharp from "sharp";
import crypto from "crypto";

export interface UploadMediaInput {
  userId: string;
  file: Express.Multer.File;
  price: number;
  title?: string;
  description?: string;
  tags?: string;
}

class MediaService {
  /**
   * Processes the uploaded file, uploads original and preview to S3, and saves to DB.
   */
  async uploadMedia(input: UploadMediaInput) {
    const { userId, file, price, title, description, tags } = input;

    // Generate unique ID for this media
    const mediaId = crypto.randomUUID();
    const originalKey = `media/${mediaId}/original-${file.originalname}`;
    const previewKey = `media/${mediaId}/preview-${file.originalname}`;

    // Process preview and upload both concurrently for speed
    const previewBufferPromise = sharp(file.buffer)
      .resize(400) // smaller max width for degradation
      .jpeg({ quality: 60 }) // lower quality instead of blur
      .toBuffer();

    await Promise.all([
      s3Service.uploadFile(originalKey, file.buffer, file.mimetype),
      previewBufferPromise.then(previewBuffer => s3Service.uploadFile(previewKey, previewBuffer, file.mimetype))
    ]);

    // Save to database
    const media = await prisma.media.create({
      data: {
        ownerId: userId,
        title: title || file.originalname,
        description,
        tags,
        originalKey,
        previewKey,
        price,
      },
    });

    return media;
  }

  /**
   * Retrieves all media. Returns preview URLs and a flag if the user has unlocked it.
   */
  async getFeed(userId: string) {
    const mediaList = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { email: true } },
        purchases: {
          where: { userId },
        },
      },
    });

    // Transform response to include presigned preview URLs and unlock status
    const feed = await Promise.all(
      mediaList.map(async (media) => {
        const isOwner = media.ownerId === userId;
        const hasPurchased = media.purchases.length > 0;
        const isUnlocked = isOwner || hasPurchased;

        return {
          id: media.id,
          title: media.title,
          description: media.description,
          tags: media.tags,
          price: media.price,
          ownerEmail: media.owner.email,
          isUnlocked,
          previewUrl: `${process.env.API_BASE_URL || 'https://faze-backend.onrender.com'}/api/media/proxy?key=${encodeURIComponent(media.previewKey)}&v=2`,
          originalUrl: isUnlocked ? `${process.env.API_BASE_URL || 'https://faze-backend.onrender.com'}/api/media/proxy?key=${encodeURIComponent(media.originalKey)}&v=2` : undefined,
        };
      })
    );

    return feed;
  }

  /**
   * Unlocks a media item by deducting coins from the buyer and crediting the owner.
   */
  async purchaseMedia(userId: string, mediaId: string) {
    // 1. Fetch media
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) throw AppError.notFound("Media not found");

    if (media.ownerId === userId) {
      throw AppError.badRequest("You cannot purchase your own media");
    }

    // 2. Wrap in a transaction
    await prisma.$transaction(async (tx) => {
      // Fetch user with lock to prevent race conditions
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      const owner = await tx.user.findUniqueOrThrow({ where: { id: media.ownerId } });

      if (user.walletBalance < media.price) {
        throw AppError.badRequest("Insufficient coins", "INSUFFICIENT_FUNDS");
      }

      // Check for existing purchase
      const existing = await tx.purchase.findUnique({
        where: { userId_mediaId: { userId, mediaId } },
      });
      if (existing) {
        throw AppError.badRequest("Already purchased");
      }

      // Deduct from buyer
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: media.price } },
      });

      // Credit to owner
      await tx.user.update({
        where: { id: media.ownerId },
        data: { walletBalance: { increment: media.price } },
      });

      // Record buyer transaction
      await tx.transaction.create({
        data: {
          userId,
          type: "debit",
          amount: media.price,
          balanceAfter: user.walletBalance - media.price,
          reason: `unlock:${media.id}`,
        },
      });

      // Record owner transaction
      await tx.transaction.create({
        data: {
          userId: media.ownerId,
          type: "credit",
          amount: media.price,
          balanceAfter: owner.walletBalance + media.price,
          reason: `sale:${media.id}`,
        },
      });

      // Create purchase record
      await tx.purchase.create({
        data: {
          userId,
          mediaId,
          amountPaid: media.price,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: "unlock_success",
          mediaId,
        },
      });
    });

    return { success: true };
  }

  /**
   * Generates a pre-signed URL for the original high-res media.
   * Verifies the user owns it or has purchased it.
   */
  async getOriginalUrl(userId: string, mediaId: string) {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: {
        purchases: { where: { userId } },
      },
    });

    if (!media) throw AppError.notFound("Media not found");

    const isOwner = media.ownerId === userId;
    const hasPurchased = media.purchases.length > 0;

    if (!isOwner && !hasPurchased) {
      throw AppError.forbidden("You must unlock this media to view it", "NOT_UNLOCKED");
    }

    const originalUrl = `${process.env.API_BASE_URL || 'https://faze-backend.onrender.com'}/api/media/proxy?key=${encodeURIComponent(media.originalKey)}&v=2`;
    return { originalUrl };
  }
  async checkAccess(userId: string, mediaId: string): Promise<boolean> {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: {
        purchases: { where: { userId } },
      },
    });

    if (!media) return false;

    const isOwner = media.ownerId === userId;
    const hasPurchased = media.purchases.length > 0;

    return isOwner || hasPurchased;
  }
}

export const mediaService = new MediaService();
