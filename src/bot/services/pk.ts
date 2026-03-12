import { prisma } from '../../database/prisma';
import { EmbedBuilder } from 'discord.js';

class PKGameService {
    public async simulateBattle(player1Id: string, player2Id: string) {
        const pet1 = await prisma.pet.findFirst({ where: { ownerId: player1Id } });
        const pet2 = await prisma.pet.findFirst({ where: { ownerId: player2Id } });

        if (!pet1) return { success: false, message: `❌ Bạn chưa có sinh vật nào để chiến đấu!` };
        if (!pet2) return { success: false, message: `❌ Đối thủ chưa có sinh vật nào để chiến đấu!` };

        let stats1: any = {}, skills1: any[] = [], traits1: any[] = [];
        let stats2: any = {}, skills2: any[] = [], traits2: any[] = [];

        try {
            stats1 = JSON.parse(pet1.stats);
            skills1 = JSON.parse(pet1.skills);
            traits1 = JSON.parse(pet1.traits);
            
            stats2 = JSON.parse(pet2.stats);
            skills2 = JSON.parse(pet2.skills);
            traits2 = JSON.parse(pet2.traits);
        } catch (e) {
            return { success: false, message: `❌ Lỗi đọc dữ liệu sinh vật.` };
        }

        let hp1 = stats1.hp || 100;
        let hp2 = stats2.hp || 100;
        const maxHp1 = hp1;
        const maxHp2 = hp2;
        
        let turnLog = [];
        let p1Turn = (stats1.spd || 10) >= (stats2.spd || 10);
        
        const MAX_TURNS = 20; // To prevent infinite loops
        let currentTurn = 1;

        // Auto combat engine
        while (hp1 > 0 && hp2 > 0 && currentTurn <= MAX_TURNS) {
            // Determine active and target
            const attacker = p1Turn ? 1 : 2;
            const attackerPet = p1Turn ? pet1 : pet2;
            const defenderPet = p1Turn ? pet2 : pet1;
            const attackerStats = p1Turn ? stats1 : stats2;
            const defenderStats = p1Turn ? stats2 : stats1;
            const attackerSkills = p1Turn ? skills1 : skills2;
            const attackerTraits = p1Turn ? traits1 : traits2;

            // Passive check (Lore-based passive: below 30% HP -> ATK x 1.5)
            let currentAtk = attackerStats.atk || 10;
            const hpRatio = (p1Turn ? hp1 : hp2) / (p1Turn ? maxHp1 : maxHp2);
            let traitTriggered = '';

            if (hpRatio < 0.3 && attackerTraits.length > 0) {
                 const traitName = attackerTraits[0].name || "Nội Tại Giấu Kín";
                 currentAtk = Math.floor(currentAtk * 1.5);
                 traitTriggered = ` [*${traitName} kích hoạt*]`;
            }

            // Pick random skill
            const skill = attackerSkills.length > 0 ? attackerSkills[Math.floor(Math.random() * attackerSkills.length)] : { name: "Đánh thường", power: 10 };
            
            // Damage calculation: (ATK * Skill Power / 10) - DEF
            let damage = Math.floor(((currentAtk * (skill.power || 20)) / 15) - ((defenderStats.def || 10) * 0.5));
            if (damage < 1) damage = 1; // Minimum damage

            // Apply damage
            if (p1Turn) {
                hp2 -= damage;
            } else {
                hp1 -= damage;
            }

            turnLog.push(`🥊 **Turn ${currentTurn}**: **${attackerPet.name}** dùng \`${skill.name}\`${traitTriggered} gây **${damage}** sát thương lên **${defenderPet.name}**!`);
            
            p1Turn = !p1Turn; // Swap turn
            currentTurn++;
        }

        const isDraw = hp1 > 0 && hp2 > 0;
        const p1Won = hp1 > 0 && hp2 <= 0;
        const winner = isDraw ? null : (p1Won ? pet1 : pet2);
        
        const embed = new EmbedBuilder()
            .setTitle(`⚔️ Báo Cáo Trận Đấu: ${pet1.name} vs ${pet2.name}`)
            .setColor(isDraw ? 0xFFFF00 : (p1Won ? 0x00FF00 : 0xFF0000))
            .setDescription(turnLog.join('\n'));

        if (isDraw) {
            embed.addFields({ name: '🏆 KẾT QUẢ', value: `Trận đấu hòa vì hết ${MAX_TURNS} lượt!` });
        } else {
            embed.addFields({ name: '🏆 KẾT QUẢ', value: `Vinh quang thuộc về **${winner?.name}**!` });
        }
        
        embed.addFields({ name: 'Tình trạng HP', value: `**${pet1.name}**: ${Math.max(hp1, 0)}/${maxHp1}\n**${pet2.name}**: ${Math.max(hp2, 0)}/${maxHp2}` });

        return { success: true, embeds: [embed] };
    }
}

export const pkGameService = new PKGameService();
