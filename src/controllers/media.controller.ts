import { Request, Response } from "express";
import { mediaService } from "../services/media.service";
import { AppError } from "../utils/AppError";
import z from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import axios from "axios";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || "http://192.168.1.3:9090",
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
  const key = req.query.key as string;
  if (!key) throw AppError.badRequest("Key is required");

  if (key.startsWith("http")) {
    return res.redirect(key);
  }

  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET || "faze-media",
    Key: key,
  });
  
  const realUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  try {
    const response = await axios.get(realUrl, { responseType: 'stream' });
    res.set('Content-Type', response.headers['content-type']);
    response.data.pipe(res);
  } catch (err: any) {
    console.error("Proxy error:", err.message);
    res.status(404).send("Image not found");
  }
});
