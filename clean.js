const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

async function clean() {
  const media = await prisma.media.findMany();
  let count = 0;
  for (const m of media) {
    try {
      if (m.previewKey.startsWith('http')) continue;
      await axios.get('http://192.168.1.3:4000/api/media/proxy?key=' + encodeURIComponent(m.previewKey));
    } catch (e) {
      if (e.response && e.response.status === 404) {
        await prisma.purchase.deleteMany({where: {mediaId: m.id}});
        await prisma.media.delete({where: {id: m.id}});
        count++;
        console.log('Deleted missing media:', m.title);
      }
    }
  }
  console.log('Cleaned up', count, 'broken items.');
  await prisma.$disconnect();
}

clean();
