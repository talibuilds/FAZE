import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  // Create a test user if it doesn't exist to own the seeded media
  const email = 'creator@faze.app';
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: 'Faze Creator',
        passwordHash: 'dummy_hash', // In reality, use bcrypt
        walletBalance: 1000,
      },
    });
    console.log(`Created user: ${user.email}`);
  }

  // Seed sample images (using high quality Unsplash URLs)
  const sampleMedia = [
    {
      title: 'Neon Cyberpunk City',
      description: 'A glowing cyberpunk street at night, full of neon lights and futuristic vibes. Perfect for wallpapers.',
      tags: 'cyberpunk, city, neon, night',
      price: 150,
      url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80',
    },
    {
      title: 'Serene Mountain Lake',
      description: 'A crystal clear mountain lake reflecting the majestic peaks at sunrise. Calming and peaceful.',
      tags: 'nature, mountains, lake, sunrise',
      price: 250,
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    },
    {
      title: 'Abstract Fluid Art',
      description: 'Colorful fluid acrylic painting with vibrant reds, blues, and gold.',
      tags: 'abstract, art, colorful, paint',
      price: 100,
      url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
    },
    {
      title: 'Vintage Sports Car',
      description: 'A classic vintage sports car parked on a scenic coastal road.',
      tags: 'car, vintage, classic, road',
      price: 300,
      url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
    },
    {
      title: 'Majestic Tiger',
      description: 'Close up portrait of a Bengal Tiger looking fiercely into the camera.',
      tags: 'animals, tiger, wildlife, portrait',
      price: 500,
      url: 'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?w=800&q=80',
    }
  ];

  for (const media of sampleMedia) {
    await prisma.media.create({
      data: {
        ownerId: user.id,
        title: media.title,
        description: media.description,
        tags: media.tags,
        price: media.price,
        previewKey: media.url,
        originalKey: media.url.replace('&q=80', '&q=100').replace('w=800', 'w=2000'), // Faking high-res original
      },
    });
  }

  console.log(`Seeded ${sampleMedia.length} sample images into the database!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
