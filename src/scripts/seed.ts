import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import { s3Service } from '../services/s3.service';
import sharp from 'sharp';

const prisma = new PrismaClient();

const sampleImages = [
  { url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&q=80', title: 'Lion Portrait', price: 100 },
  { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80', title: 'Abstract Art', price: 50 },
  { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80', title: 'Portrait Photo', price: 200 },
  { url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80', title: 'Scenic Landscape', price: 150 },
];

async function seed() {
  console.log('Starting seed...');
  
  // Create a creator user
  const email = 'creator@example.com';
  let creator = await prisma.user.findUnique({ where: { email } });
  if (!creator) {
    creator = await prisma.user.create({
      data: {
        email,
        name: 'Jane Creator',
        passwordHash: await bcrypt.hash('password123', 10),
        walletBalance: 0,
      }
    });
    console.log('Created creator user.');
  }

  await s3Service.ensureBucket();

  for (const img of sampleImages) {
    try {
      console.log(`Downloading ${img.title}...`);
      const response = await axios.get(img.url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');

      const originalKey = `uploads/original/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const previewKey = `uploads/preview/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

      // Upload original
      await s3Service.uploadFile(originalKey, buffer, 'image/jpeg');

      // Create preview
      const previewBuffer = await sharp(buffer)
        .resize(800)
        .blur(30)
        .jpeg({ quality: 60 })
        .toBuffer();
      
      await s3Service.uploadFile(previewKey, previewBuffer, 'image/jpeg');

      await prisma.media.create({
        data: {
          ownerId: creator.id,
          title: img.title,
          price: img.price,
          originalKey,
          previewKey,
        }
      });
      console.log(`Seeded ${img.title}.`);
    } catch (err) {
      console.error(`Failed to seed ${img.title}:`, err);
    }
  }

  console.log('Seeding complete!');
}

seed()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
