import { 
    ChatInputCommandInteraction, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType,
    ButtonInteraction,
    Message
} from 'discord.js';
import { prisma } from '../../database/prisma';
import { petService } from './pet';

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

const TURN_TIMEOUT_MS = 45_000;
const MAX_ROUNDS = 25;

function parsePet(pet: any): PetSnapshot {
    const stats = JSON.parse(pet.stats || '{}');
    const skills = JSON.parse(pet.skills || '[]');
    const traits = JSON.parse(pet.traits || '[]');

    const baseHp = stats.hp || 100;
    const baseMp = stats.mp || 80;
    const baseAtk = stats.atk || 10;
    const baseDef = stats.def || 10;
    const baseSpd = stats.spd || 10;

    const hpMultiplier = 3.5;
    const scaledHp = Math.floor(baseHp * hpMultiplier);

    return {
        id: pet.id,
        ownerId: pet.ownerId,
        name: pet.name,
        species: pet.species,
        hp: scaledHp,
        maxHp: scaledHp,
        mp: baseMp,
        maxMp: baseMp,
        atk: baseAtk,
        def: baseDef,
        spd: baseSpd,
        skills,
        traits,
        imageData: pet.imageData || '',
        level: pet.level || 1
    };
}

function calcDamage(attacker: PetSnapshot, defender: PetSnapshot, skill: any): { damage: number, isCrit: boolean, isMiss: boolean } {
    let missChance = 0.05;
    if (defender.spd > attacker.spd) {
        missChance += Math.min(0.30, (defender.spd - attacker.spd) * 0.005);
    }
    const isMiss = Math.random() < missChance;
    if (isMiss) return { damage: 0, isCrit: false, isMiss: true };

    const power = skill?.power || 10;

    const rawDamage = (attacker.atk * power) / 50;

    const defReduction = defender.def / (defender.def + 80);
    let damage = Math.max(1, Math.floor(rawDamage * (1 - defReduction)));

    const variance = Math.floor(damage * 0.15);
    damage += Math.floor(Math.random() * (variance * 2 + 1)) - variance;

    damage = Math.max(1, damage);

    const critChance = 0.08 + (attacker.spd * 0.0008);
    const isCrit = Math.random() < critChance;
    if (isCrit) {
        damage = Math.floor(damage * 1.4);
    }

    return { damage, isCrit, isMiss };
}

function buildStatusBar(current: number, max: number, size = 10): string {
    const filled = Math.round((current / max) * size);
    const empty = size - Math.max(0, filled);
    return '█'.repeat(Math.max(0, filled)) + '░'.repeat(empty);
}

function buildBattleEmbed(p1: PetSnapshot, p2: PetSnapshot, turn: 'p1' | 'p2', log: string[], round: number): EmbedBuilder {
    const activeP = turn === 'p1' ? p1 : p2;
    return new EmbedBuilder()
        .setTitle(`⚔️ PK — Vòng ${round}`)
        .setColor(turn === 'p1' ? 0x3B82F6 : 0xEF4444)
        .addFields(
            {
                name: `🔵 ${p1.name} (Lv.${p1.level})`,
                value: `❤️ ${buildStatusBar(p1.hp, p1.maxHp)} ${p1.hp}/${p1.maxHp}\n💙 ${buildStatusBar(p1.mp, p1.maxMp)} ${p1.mp}/${p1.maxMp}\n⚔️ ATK: ${p1.atk} | 🛡️ DEF: ${p1.def} | 💨 SPD: ${p1.spd}`,
                inline: true
            },
            {
                name: `🔴 ${p2.name} (Lv.${p2.level})`,
                value: `❤️ ${buildStatusBar(p2.hp, p2.maxHp)} ${p2.hp}/${p2.maxHp}\n💙 ${buildStatusBar(p2.mp, p2.maxMp)} ${p2.mp}/${p2.maxMp}\n⚔️ ATK: ${p2.atk} | 🛡️ DEF: ${p2.def} | 💨 SPD: ${p2.spd}`,
                inline: true
            },
            {
                name: `📋 Log (vòng ${round})`,
                value: log.slice(-4).join('\n') || '— Trận chiến bắt đầu —',
                inline: false
            }
        )
        .setFooter({ text: `Lượt của: ${activeP.name} • Chọn kỹ năng trong 45 giây!` });
}

function buildSkillButtons(pet: PetSnapshot, prefix: string): ActionRowBuilder<ButtonBuilder>[] {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    
    const normalAtk = new ButtonBuilder()
        .setCustomId(`${prefix}_normal`)
        .setLabel('👊 Tấn Công Thường')
        .setStyle(ButtonStyle.Secondary);

    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(normalAtk);

    (pet.skills || []).slice(0, 3).forEach((skill: any, i: number) => {
        const mpCost = skill.cost || 10;
        const btn = new ButtonBuilder()
            .setCustomId(`${prefix}_skill_${i}`)
            .setLabel(`⚡ ${skill.name} (-${mpCost} MP)`)
            .setStyle(pet.mp >= mpCost ? ButtonStyle.Primary : ButtonStyle.Danger)
            .setDisabled(pet.mp < mpCost);
        row1.addComponents(btn);
    });

    rows.push(row1);
    return rows;
}

export class PkService {
    async startBattle(interaction: ChatInputCommandInteraction, targetUserId: string) {
        const player1Id = interaction.user.id;
        const player2Id = targetUserId;

        if (player1Id === player2Id) {
            return interaction.editReply('❌ Không thể tự thách đấu chính mình!');
        }

        const [rawP1Pet, rawP2Pet] = await Promise.all([
            prisma.pet.findFirst({ where: { ownerId: player1Id } }),
            prisma.pet.findFirst({ where: { ownerId: player2Id } })
        ]);

        if (!rawP1Pet) return interaction.editReply('❌ Bạn chưa có sinh vật! Dùng `/pet start`.');
        if (!rawP2Pet) return interaction.editReply('❌ Đối thủ chưa có sinh vật!');

        const p1 = parsePet(rawP1Pet);
        const p2 = parsePet(rawP2Pet);

        const log: string[] = [];
        let round = 1;
        let currentTurn: 'p1' | 'p2' = p1.spd >= p2.spd ? 'p1' : 'p2';

        log.push(`**Trận chiến bắt đầu!** ${p1.name} vs ${p2.name}`);
        log.push(`🔰 Lượt đầu: **${currentTurn === 'p1' ? p1.name : p2.name}** (SPD cao hơn)`);

        const embed = buildBattleEmbed(p1, p2, currentTurn, log, round);
        const activeP = currentTurn === 'p1' ? p1 : p2;
        const rows = buildSkillButtons(activeP, currentTurn);

        const battleMsg = await interaction.editReply({ embeds: [embed], components: rows }) as Message;

        const processTurn = async (collected: ButtonInteraction, attacker: PetSnapshot, defender: PetSnapshot, prefix: string) => {
            await collected.deferUpdate();
            const customId = collected.customId;

            let damage = 0;
            let skillName = 'Tấn Công Thường';
            let mpCost = 0;
            let isCrit = false;
            let isMiss = false;

            if (customId === `${prefix}_normal`) {
                const res = calcDamage(attacker, defender, { power: 10 });
                damage = res.damage;
                isCrit = res.isCrit;
                isMiss = res.isMiss;
            } else if (customId.startsWith(`${prefix}_skill_`)) {
                const skillIdx = parseInt(customId.replace(`${prefix}_skill_`, ''));
                const skill = attacker.skills[skillIdx];
                if (skill && attacker.mp >= (skill.cost || 10)) {
                    mpCost = skill.cost || 10;
                    skillName = skill.name;
                    const res = calcDamage(attacker, defender, skill);
                    damage = res.damage;
                    isCrit = res.isCrit;
                    isMiss = res.isMiss;
                } else {
                    const res = calcDamage(attacker, defender, { power: 10 });
                    damage = res.damage;
                    isCrit = res.isCrit;
                    isMiss = res.isMiss;
                    skillName = 'Tấn Công Thường (không đủ MP)';
                }
            }

            attacker.mp = Math.max(0, attacker.mp - mpCost);
            defender.hp = Math.max(0, defender.hp - damage);

            if (isMiss) {
                log.push(`💨 **${defender.name}** đã né được chiêu **${skillName}** của ${attacker.name}!`);
            } else {
                log.push(`${isCrit ? '💥 CRIT! ' : ''}**${attacker.name}** dùng **${skillName}** → -${damage} HP cho ${defender.name}${mpCost ? ` (-${mpCost} MP)` : ''}`);
            }
        };

        const runTurns = async (): Promise<'p1' | 'p2' | 'timeout'> => {
            while (p1.hp > 0 && p2.hp > 0 && round <= MAX_ROUNDS) {
                const attacker = currentTurn === 'p1' ? p1 : p2;
                const defender  = currentTurn === 'p1' ? p2 : p1;
                const prefix    = currentTurn;
                const attackerId = attacker.ownerId;

                const updatedEmbed = buildBattleEmbed(p1, p2, currentTurn, log, round);
                const rows = buildSkillButtons(attacker, prefix);
                await battleMsg.edit({ embeds: [updatedEmbed], components: rows });

                try {
                    const collected = await battleMsg.awaitMessageComponent({
                        componentType: ComponentType.Button,
                        filter: (i) => i.user.id === attackerId && i.customId.startsWith(prefix),
                        time: TURN_TIMEOUT_MS
                    });

                    await processTurn(collected, attacker, defender, prefix);
                } catch {
                    log.push(`⏰ **${attacker.name}** không hành động — mất lượt!`);
                }

                if (p1.hp <= 0 || p2.hp <= 0) break;

                currentTurn = currentTurn === 'p1' ? 'p2' : 'p1';
                round++;
                p1.mp = Math.min(p1.maxMp, p1.mp + 10);
                p2.mp = Math.min(p2.maxMp, p2.mp + 10);
            }

            if (p1.hp <= 0) return 'p2';
            if (p2.hp <= 0) return 'p1';
            return 'timeout';
        };

        const winner = await runTurns();

        const winnerId = winner === 'p1' ? player1Id : winner === 'p2' ? player2Id : null;
        const winnerPet = winner === 'p1' ? p1 : p2;
        const loserPet  = winner === 'p1' ? p2 : p1;

        const expReward  = 50 + round * 5;
        const coinReward = 100 + round * 10;

        if (winnerId) {
            await prisma.$transaction(async (tx) => {
                await tx.userIdentity.update({ where: { userId: winnerId }, data: { money: { increment: coinReward } } });
            });
            const { levelsGained, messages } = await petService.addExpAndLevelUp(winnerPet.id, expReward);
            if (levelsGained > 0) {
                 log.push(...messages);
            }
        }

        const resultEmbed = new EmbedBuilder()
            .setTitle(winner === 'timeout' ? '⏰ Hết Giờ — Hòa!' : `🏆 ${winnerPet.name} CHIẾN THẮNG!`)
            .setColor(winner === 'timeout' ? 0xAAAAAA : 0xFFD700)
            .addFields(
                { name: '📋 Diễn Biến Trận Đấu', value: log.slice(-8).join('\n') || '—', inline: false },
                { name: `🔵 ${p1.name}`, value: `❤️ HP còn lại: ${p1.hp}/${p1.maxHp}`, inline: true },
                { name: `🔴 ${p2.name}`, value: `❤️ HP còn lại: ${p2.hp}/${p2.maxHp}`, inline: true }
            );

        if (winnerId) {
            resultEmbed.addFields({
                name: '🎁 Phần Thưởng Chiến Thắng',
                value: `${winnerPet.name} nhận: **+${expReward} EXP** & **+${coinReward} Coin**!`,
                inline: false
            });
        }

        const files = [];
        const winPetRaw = winner === 'p1' ? rawP1Pet : rawP2Pet;
        if (winPetRaw && winPetRaw.imageData && winPetRaw.imageData.startsWith('data:image')) {
            const base64Data = winPetRaw.imageData.replace(/^data:image\/(png|jpeg);base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            files.push({ attachment: buffer, name: 'winner.png' });
            resultEmbed.setThumbnail('attachment://winner.png');
        }

        await battleMsg.edit({ embeds: [resultEmbed], components: [], files });

        await prisma.pkBattle.create({
            data: {
                player1Id,
                player2Id,
                winnerId: winnerId || undefined,
                log: JSON.stringify(log),
                status: 'finished'
            }
        });
    }
}

export const pkService = new PkService();
