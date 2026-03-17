import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetGameData() {
    console.log('🗑️  CLEAR DỮ LIỆU GAME PET CHO OPEN BETA...\n');

    const tables = [
        { name: 'Pet', fn: () => prisma.pet.deleteMany() },
        { name: 'InventoryItem', fn: () => prisma.inventoryItem.deleteMany() },
        { name: 'UserIdentity', fn: () => prisma.userIdentity.deleteMany() },
        { name: 'ExpeditionProgress', fn: () => (prisma as any).expeditionProgress.deleteMany() },
        { name: 'TowerProgress', fn: () => prisma.towerProgress.deleteMany() },
        { name: 'PkBattle', fn: () => prisma.pkBattle.deleteMany() },
        { name: 'UserDailyPk', fn: () => (prisma as any).userDailyPk.deleteMany() },
        { name: 'UserEggCooldown', fn: () => prisma.userEggCooldown.deleteMany() },
        { name: 'UserItemPurchaseLog', fn: () => prisma.userItemPurchaseLog.deleteMany() },
    ];

    for (const t of tables) {
        try {
            const result = await t.fn();
            console.log(`  ✅ ${t.name}: Đã xoá ${(result as any).count} records`);
        } catch (err: any) {
            console.log(`  ⚠️  ${t.name}: ${err.message}`);
        }
    }

    console.log('\n🚀 CLEAR XONG! Sẵn sàng cho Open Beta!');
    await prisma.$disconnect();
}

resetGameData();
