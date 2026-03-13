import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Bắt đầu chuẩn hóa dữ liệu Pet theo Rule mới (Max 4 Skills, Max Bậc 10)...');

  const pets = await prisma.pet.findMany();
  let updatedCount = 0;

  for (const pet of pets) {
    let needsUpdate = false;
    let newSkills = "[]";
    let newStage = pet.evolutionStage;

    // 1. Gọt kỹ năng nều > 4
    try {
      const skillsArr = JSON.parse(pet.skills as string);
      if (Array.isArray(skillsArr) && skillsArr.length > 4) {
         console.log(`✂️ Lọc bớt kỹ năng cho Pet ID ${pet.id} (${pet.name}): ${skillsArr.length} => 4`);
         newSkills = JSON.stringify(skillsArr.slice(-4));
         needsUpdate = true;
      } else {
         newSkills = pet.skills as string;
      }
    } catch(e) {
      newSkills = pet.skills as string;
    }

    // 2. Chặn Bậc Tiến Hóa max 10
    if (pet.evolutionStage > 10) {
      console.log(`⏬ Giảm bậc tiến hóa cho Pet ID ${pet.id} (${pet.name}): ${pet.evolutionStage} => 10`);
      newStage = 10;
      needsUpdate = true;
    }

    if (needsUpdate) {
       await prisma.pet.update({
         where: { id: pet.id },
         data: {
           skills: newSkills,
           evolutionStage: newStage
         }
       });
       updatedCount++;
    }
  }

  console.log(`✅ Hoàn thành! Đã chuẩn hóa ${updatedCount}/${pets.length} sinh vật.`);
}

main()
  .catch(e => {
    console.error('❌ Lỗi Migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
