import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.expeditionProgress.updateMany({
      data: {
        lastAttempt: new Date(0) // Đưa thời gian attempt về 1970 (Hết cooldown ngay lập tức)
      }
    });
    console.log(`✅ Đã reset thành công cooldown Viễn Chinh cho ${result.count} người chơi!`);
  } catch (error) {
    console.error('Lỗi khi reset:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
