import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { prisma } from '../../database/prisma';
import { petService } from './pet';
import { userIdentityService } from './identity';

interface PetSnapshot {
    id: number;
    ownerId: string;
    name: string;
    species: string;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    atk: number;
    def: number;
    spd: number;
    skills: any[];
    traits: any[];
    imageData: string;
    level: number;
}

const MAX_ROUNDS = 50;

export function parsePet(pet: any): PetSnapshot {
    const stats = JSON.parse(pet.stats || '{}');
    const skills = JSON.parse(pet.skills || '[]');
    const traits = JSON.parse(pet.traits || '[]');

    return {
        id: pet.id,
        ownerId: pet.ownerId,
        name: pet.name,
        species: pet.species,
        hp: stats.hp || 100,
        maxHp: stats.hp || 100,
        mp: stats.mp || 80,
        maxMp: stats.mp || 80,
        atk: stats.atk || 10,
        def: stats.def || 10,
        spd: stats.spd || 10,
        skills,
        traits,
        imageData: pet.imageData || '',
        level: pet.level || 1
    };
}

export interface PetBuffs {
    critBonus: number; dodgeBonus: number; hpRegenPct: number; atkBoost: number; defBoost: number;
}
export function calcTraitsBuff(pet: PetSnapshot): PetBuffs {
    const b = { critBonus: 0, dodgeBonus: 0, hpRegenPct: 0, atkBoost: 0, defBoost: 0 };
    for (const t of pet.traits) {
        const v = typeof t.value === 'number' ? t.value : 0;
        if (t.type === 'crit') b.critBonus += v;
        else if (t.type === 'dodge') b.dodgeBonus += v;
        else if (t.type === 'hp_regen') b.hpRegenPct += v;
        else if (t.type === 'atk_boost') b.atkBoost += v;
        else if (t.type === 'def_boost') b.defBoost += v;
    }
    return b;
}

export function calcDamage(attacker: PetSnapshot, defender: PetSnapshot, skill: any, aBuffs: PetBuffs, dBuffs: PetBuffs): { damage: number, isCrit: boolean, isMiss: boolean } {
    let missChance = 0.05 + dBuffs.dodgeBonus;
    if (defender.spd > attacker.spd) {
        missChance += Math.min(0.30, (defender.spd - attacker.spd) * 0.005);
    }
    const isMiss = Math.random() < missChance;
    if (isMiss) return { damage: 0, isCrit: false, isMiss: true };

    const power = skill?.power || 10;
    const effAtk = attacker.atk * (1 + aBuffs.atkBoost);
    const rawDamage = (effAtk * power) / 20;

    const effDef = defender.def * (1 + dBuffs.defBoost);
    const defReduction = effDef / (effDef + 150);
    let damage = Math.max(1, Math.floor(rawDamage * (1 - defReduction)));

    const variance = Math.floor(damage * 0.15);
    damage += Math.floor(Math.random() * (variance * 2 + 1)) - variance;
    damage = Math.max(1, damage);

    const critChance = 0.08 + (attacker.spd * 0.0008) + aBuffs.critBonus;
    const isCrit = Math.random() < critChance;
    if (isCrit) {
        damage = Math.floor(damage * 1.4);
    }

    return { damage, isCrit, isMiss };
}

function runAutoCombat(p1: PetSnapshot, p2: PetSnapshot) {
    const log: string[] = [];
    let round = 1;
    let currentTurn: 'p1' | 'p2' = p1.spd >= p2.spd ? 'p1' : 'p2';
    const p1Buffs = calcTraitsBuff(p1);
    const p2Buffs = calcTraitsBuff(p2);

    while (p1.hp > 0 && p2.hp > 0 && round <= MAX_ROUNDS) {
        const attacker = currentTurn === 'p1' ? p1 : p2;
        const defender = currentTurn === 'p1' ? p2 : p1;
        const aBuffs = currentTurn === 'p1' ? p1Buffs : p2Buffs;
        const dBuffs = currentTurn === 'p1' ? p2Buffs : p1Buffs;

        let chosenSkill = null;
        const availableSkills = attacker.skills.filter((s:any) => attacker.mp >= (s.cost || 10));
        if (availableSkills.length > 0 && Math.random() < 0.8) {
            chosenSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
        }

        let damage = 0;
        let skillName = 'Tấn Công Thường';
        let mpCost = 0;
        let isCrit = false;
        let isMiss = false;

        if (chosenSkill) {
            mpCost = chosenSkill.cost || 10;
            skillName = chosenSkill.name;
            const res = calcDamage(attacker, defender, chosenSkill, aBuffs, dBuffs);
            damage = res.damage; isCrit = res.isCrit; isMiss = res.isMiss;
        } else {
            const res = calcDamage(attacker, defender, { power: 10 }, aBuffs, dBuffs);
            damage = res.damage; isCrit = res.isCrit; isMiss = res.isMiss;
            if (attacker.mp < 10 && availableSkills.length === 0) skillName = 'Hụt Hơi (Không đủ MP)';
        }

        attacker.mp = Math.max(0, attacker.mp - mpCost);
        defender.hp = Math.max(0, defender.hp - damage);

        if (isMiss) log.push(`💨 **${defender.name}** đã né được chiêu **${skillName}** của ${attacker.name}!`);
        else log.push(`${isCrit ? '💥 CRIT! ' : ''}**${attacker.name}** dùng **${skillName}** → -${damage} HP cho ${defender.name}`);

        if (p1.hp <= 0 || p2.hp <= 0) break;

        currentTurn = currentTurn === 'p1' ? 'p2' : 'p1';
        round++;
        p1.mp = Math.min(p1.maxMp, p1.mp + 15);
        p2.mp = Math.min(p2.maxMp, p2.mp + 15);
        
        if (p1Buffs.hpRegenPct > 0) p1.hp = Math.min(p1.maxHp, p1.hp + Math.floor(p1.maxHp * p1Buffs.hpRegenPct));
        if (p2Buffs.hpRegenPct > 0) p2.hp = Math.min(p2.maxHp, p2.hp + Math.floor(p2.maxHp * p2Buffs.hpRegenPct));
    }

    const winner = p1.hp > 0 && p2.hp <= 0 ? 'p1' : p2.hp > 0 && p1.hp <= 0 ? 'p2' : 'timeout';
    return { winner, p1, p2, log, round };
}

export class PkService {

    async checkAndIncrementDailyLimit(userId: string, incrementBy: number = 1): Promise<boolean> {
        let record = await prisma.userDailyPk.findUnique({ where: { userId } });
        const now = new Date();

        if (!record) {
            record = await prisma.userDailyPk.create({ data: { userId, dailyCount: incrementBy, lastPkTime: now } });
            return true;
        }

        const isSameDay = record.lastPkTime.getDate() === now.getDate() &&
                          record.lastPkTime.getMonth() === now.getMonth() &&
                          record.lastPkTime.getFullYear() === now.getFullYear();

        if (!isSameDay) {
            await prisma.userDailyPk.update({
                where: { userId },
                data: { dailyCount: incrementBy, lastPkTime: now }
            });
            return true;
        }

        if (record.dailyCount + incrementBy > 5) {
            return false;
        }

        await prisma.userDailyPk.update({
            where: { userId },
            data: { dailyCount: record.dailyCount + incrementBy, lastPkTime: now }
        });

        return true;
    }

    async getDailyLimitRemaining(userId: string): Promise<number> {
        let record = await prisma.userDailyPk.findUnique({ where: { userId } });
        const now = new Date();
        
        if (!record) return 5;

        const isSameDay = record.lastPkTime.getDate() === now.getDate() &&
                          record.lastPkTime.getMonth() === now.getMonth() &&
                          record.lastPkTime.getFullYear() === now.getFullYear();
                          
        if (!isSameDay) return 5;
        return Math.max(0, 5 - record.dailyCount);
    }

    async startBattle(interaction: ChatInputCommandInteraction, targetUserId: string) {
        const player1Id = interaction.user.id;
        const player2Id = targetUserId;

        if (player1Id === player2Id) {
            return interaction.editReply('❌ Không thể tự thách đấu chính mình!');
        }

        const remaining = await this.getDailyLimitRemaining(player1Id);
        if (remaining <= 0) {
            return interaction.editReply('❌ Bạn đã hết lượt PK hôm nay (Tối đa 5 lần). Quỷ vương cũng cần nghỉ ngơi, hãy quay lại vào ngày mai!');
        }

        const [rawP1Pet, rawP2Pet] = await Promise.all([
            prisma.pet.findFirst({ where: { ownerId: player1Id } }),
            prisma.pet.findFirst({ where: { ownerId: player2Id } })
        ]);

        if (!rawP1Pet) return interaction.editReply('❌ Bạn chưa có sinh vật! Dùng `/pet start`.');
        if (!rawP2Pet) return interaction.editReply('❌ Đối thủ chưa có sinh vật!');

        // Consume 1 ticket
        await this.checkAndIncrementDailyLimit(player1Id, 1);

        const p1 = parsePet(rawP1Pet);
        const p2 = parsePet(rawP2Pet);

        const battleResult = runAutoCombat(p1, p2);

        const winnerId = battleResult.winner === 'p1' ? player1Id : battleResult.winner === 'p2' ? player2Id : null;
        const expReward = 50 + battleResult.round * 5;
        const coinReward = 100 + battleResult.round * 10;

        if (winnerId) {
            await prisma.$transaction(async (tx) => {
                await tx.userIdentity.update({ where: { userId: winnerId }, data: { money: { increment: coinReward } } });
            });
            userIdentityService.invalidateCache(winnerId);
        }

        let levelUpMsgs: string[] = [];
        if (winnerId === player1Id) {
            const { levelsGained, messages } = await petService.addExpAndLevelUp(rawP1Pet.id, expReward);
            if (levelsGained > 0) levelUpMsgs = messages;
        }

        const resultEmbed = new EmbedBuilder()
            .setTitle(battleResult.winner === 'timeout' ? '⏰ Hết Giờ — Hòa!' : `🏆 ${battleResult.winner === 'p1' ? p1.name : p2.name} CHIẾN THẮNG!`)
            .setColor(battleResult.winner === 'timeout' ? 0xAAAAAA : (battleResult.winner === 'p1' ? 0x3B82F6 : 0xEF4444))
            .addFields(
                { name: '📋 Diễn Biến Trận Đấu (6 lượt cuối)', value: battleResult.log.slice(-6).join('\n') || '—', inline: false },
                { name: `🔵 ${p1.name} (Bạn)`, value: `❤️ HP: ${battleResult.p1.hp}/${battleResult.p1.maxHp}`, inline: true },
                { name: `🔴 ${p2.name} (Địch)`, value: `❤️ HP: ${battleResult.p2.hp}/${battleResult.p2.maxHp}`, inline: true }
            )
            .setFooter({ text: `Lượt PK còn lại trong ngày: ${remaining - 1}/5` });

        if (winnerId === player1Id) {
            resultEmbed.addFields({
                name: '🎁 Phần Thưởng Chiến Thắng',
                value: `Nhận: **+${expReward} EXP** & **+${coinReward} Coin**! ${levelUpMsgs.length ? '\n' + levelUpMsgs.join('\n') : ''}`,
                inline: false
            });
        }

        await interaction.editReply({ embeds: [resultEmbed], components: [] });

        await prisma.pkBattle.create({
            data: {
                player1Id,
                player2Id,
                winnerId: winnerId || undefined,
                log: JSON.stringify(battleResult.log),
                status: 'finished'
            }
        });
    }

    async autoChain(interaction: ChatInputCommandInteraction) {
        const player1Id = interaction.user.id;
        const remainingTicks = await this.getDailyLimitRemaining(player1Id);

        if (remainingTicks <= 0) {
            return interaction.editReply('❌ Bạn đã hết lượt PK hôm nay (Tối đa 5 lần). Hãy quay lại vào ngày mai!');
        }

        const rawP1Pet = await prisma.pet.findFirst({ where: { ownerId: player1Id } });
        if (!rawP1Pet) return interaction.editReply('❌ Bạn chưa có sinh vật! Dùng `/pet start`.');

        const enemyPets = await prisma.pet.findMany({
            where: { ownerId: { not: player1Id } },
            take: 20 
        });

        if (enemyPets.length === 0) {
            return interaction.editReply('❌ Server chưa có ai để PK cả! Cố gắng mời thêm bạn bè nhé.');
        }

        const shuffled = enemyPets.sort(() => 0.5 - Math.random());
        const selectedEnemies = shuffled.slice(0, remainingTicks);
        const actualFightsCount = selectedEnemies.length;

        await this.checkAndIncrementDailyLimit(player1Id, actualFightsCount);

        let totalExp = 0;
        let totalCoin = 0;
        let wins = 0;
        let losses = 0;
        const summaryLog: string[] = [];

        for (const enemyPet of selectedEnemies) {
            const p1 = parsePet(rawP1Pet);
            const p2 = parsePet(enemyPet);

            const battleResult = runAutoCombat(p1, p2);
            
            if (battleResult.winner === 'p1') {
                wins++;
                const expReward = 50 + battleResult.round * 5;
                const coinReward = 100 + battleResult.round * 10;
                totalExp += expReward;
                totalCoin += coinReward;
                summaryLog.push(`🟢 Thắng **${p2.name}** của <@${p2.ownerId}> (Còn ${battleResult.p1.hp} HP)`);
            } else if (battleResult.winner === 'p2') {
                losses++;
                summaryLog.push(`🔴 Thua **${p2.name}** của <@${p2.ownerId}>`);
            } else {
                summaryLog.push(`⚪ Hòa **${p2.name}** của <@${p2.ownerId}>`);
            }

            await prisma.pkBattle.create({
                data: {
                    player1Id,
                    player2Id: enemyPet.ownerId,
                    winnerId: battleResult.winner === 'p1' ? player1Id : battleResult.winner === 'p2' ? enemyPet.ownerId : undefined,
                    log: "[]",
                    status: 'finished_auto'
                }
            });
        }

        if (totalCoin > 0) {
            await prisma.userIdentity.update({ where: { userId: player1Id }, data: { money: { increment: totalCoin } } });
            userIdentityService.invalidateCache(player1Id);
        }

        let levelUpMsgs: string[] = [];
        if (totalExp > 0) {
            const { levelsGained, messages } = await petService.addExpAndLevelUp(rawP1Pet.id, totalExp);
            if (levelsGained > 0) levelUpMsgs = messages;
        }

        const embed = new EmbedBuilder()
            .setTitle(`⚔️ AUTO PK — Kết quả quét ${actualFightsCount} trận`)
            .setColor(0x8B5CF6)
            .addFields(
                { name: '📊 Tổng Kết', value: `Thắng: **${wins}** | Thua: **${losses}**`, inline: false },
                { name: '📋 Lịch sử chạm trán', value: summaryLog.join('\n') || '—', inline: false },
                { name: '🎁 Tổng Thu Hoạch', value: `**+${totalExp} EXP**\n**+${totalCoin} Coin**\n${levelUpMsgs.join('\n')}`, inline: false }
            )
            .setFooter({ text: `Lượt PK còn lại trong ngày: 0/5` });

        await interaction.editReply({ embeds: [embed] });
    }
}

export const pkService = new PkService();
