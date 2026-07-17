import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../config";

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || "http://192.168.1.3:9090",
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "faze-key",
    secretAccessKey: process.env.S3_SECRET_KEY || "faze-secret",
  },
  forcePathStyle: true, // required for s3mock/minio
});

export const s3Service = {
  async uploadFile(key: string, body: Buffer, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || "faze-media",
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    await s3Client.send(command);
  },

  async getPresignedUrl(key: string, expiresIn = 3600) {
    if (key.startsWith("http")) return key;
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET || "faze-media",
      Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
  },

  async ensureBucket() {
    const bucket = process.env.S3_BUCKET || "faze-media";
    const { CreateBucketCommand, HeadBucketCommand } = require("@aws-sdk/client-s3");
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch (err: any) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
        console.log(`Bucket ${bucket} created.`);
      }
    }
  }
};
