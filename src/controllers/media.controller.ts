import { Request, Response } from "express";
import { mediaService } from "../services/media.service";
import { AppError } from "../utils/AppError";
import z from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import axios from "axios";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || "http://localhost:9090",
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "faze-key",
    secretAccessKey: process.env.S3_SECRET_KEY || "faze-secret",
  },
  forcePathStyle: true,
});

export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const file = req.file;

  if (!file) {
    throw AppError.badRequest("Image file is required");
  }

  const { price, title, description, tags } = z
    .object({
      price: z.coerce.number().min(0, "Price cannot be negative"),
      title: z.string().optional(),
      description: z.string().optional(),
      tags: z.string().optional(),
    })
    .parse(req.body);

  const media = await mediaService.uploadMedia({
    userId,
    file,
    price,
    title,
    description,
    tags,
  });

  res.status(201).json({
    message: "Media uploaded successfully",
    data: media,
  });
});

export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const feed = await mediaService.getFeed(userId);

  res.status(200).json({
    data: feed,
  });
});

export const purchaseMedia = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const mediaId = req.params.id as string;

  await mediaService.purchaseMedia(userId, mediaId);

  res.status(200).json({
    message: "Purchase successful",
  });
});

export const getOriginalUrl = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const mediaId = req.params.id as string;

  const result = await mediaService.getOriginalUrl(userId, mediaId);

  res.status(200).json({
    data: result,
  });
});

export const proxyImage = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const key = req.query.key as string;
  if (!key) throw AppError.badRequest("Key is required");

  if (key.startsWith("http")) {
    return res.redirect(key);
  }

  // Security: Ownership Validation
  if (key.includes("/original-")) {
    const mediaIdMatch = key.match(/media\/([^\/]+)\/original-/);
    if (mediaIdMatch) {
      const mediaId = mediaIdMatch[1];
      const hasAccess = await mediaService.checkAccess(userId, mediaId);
      if (!hasAccess) {
        throw AppError.forbidden("You do not have access to this original file.");
      }
    } else {
      throw AppError.forbidden("Invalid original key format.");
    }
  }

  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET || "faze-media",
    Key: key,
  });
  
  const realUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  try {
    const response = await axios.get(realUrl, { responseType: 'stream' });
    res.set('Content-Type', response.headers['content-type'] as string || 'image/jpeg');
    response.data.pipe(res);
  } catch (err: any) {
    console.error("Proxy error:", err.message);
    // At any cost fallback: if S3 image is missing, redirect to a deterministic placeholder
    const NATURE_IMAGES = [
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
      'https://images.unsplash.com/photo-1439405326854-014607f694d7?w=800&q=80',
      'https://images.unsplash.com/photo-1498623116890-37e912163d5d?w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
      'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80',
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80',
    ];
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % NATURE_IMAGES.length;
    res.redirect(NATURE_IMAGES[index]);
  }
});
