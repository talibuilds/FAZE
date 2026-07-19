const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { username: null }
  });

  console.log(`Found ${users.length} users without usernames.`);

  for (const user of users) {
    let baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let finalUsername = baseUsername;
    let counter = 1;
    let isAvailable = false;

    while (!isAvailable) {
      const existing = await prisma.user.findUnique({ where: { username: finalUsername } });
      if (!existing) {
        isAvailable = true;
      } else {
        finalUsername = `${baseUsername}${counter}`;
        counter++;
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { username: finalUsername }
    });
    console.log(`Updated ${user.email} -> @${finalUsername}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
