import { Client, ActivityType, Routes, REST, EmbedBuilder, TextChannel } from 'discord.js';
import fs from 'fs';
import path from 'path';

let lastAnnouncedWeek = -1;

function getWeekNumber(d: Date): number {
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const days = Math.floor((d.getTime() - oneJan.getTime()) / (86400000));
    return Math.ceil((days + oneJan.getDay() + 1) / 7);
}

async function checkFridayAnnouncement(client: Client) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    const currentWeek = getWeekNumber(now);

    if (dayOfWeek === 5 && hour === 13 && currentWeek !== lastAnnouncedWeek) {
        lastAnnouncedWeek = currentWeek;

        const channelId = process.env.DISCORD_CHANNEL_ID;
        if (!channelId) return;

        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel || !(channel instanceof TextChannel)) return;

            const embed = new EmbedBuilder()
                .setTitle('🏆 PHẦN THƯỞNG XẾP HẠNG ĐÃ MỞ!')
                .setColor(0xF59E0B)
                .setDescription(
                    '📢 **Phần thưởng xếp hạng tuần này đã sẵn sàng!**\n\n' +
                    'Nếu bạn đang nằm trong **TOP 10** của các bảng xếp hạng, hãy gõ `/claim_rank` ngay để nhận phần thưởng!\n\n' +
                    '🥇 **Top 1**: 20,000 Coin + 5 Rương + 1 Đá Tiến Hóa\n' +
                    '🥈 **Top 2**: 15,000 Coin + 4 Rương + 1 Đá Tiến Hóa\n' +
                    '🥉 **Top 3**: 12,000 Coin + 3 Rương + 2 Đá EXP Lớn\n' +
                    '4️⃣-5️⃣ **Top 4-5**: 6,000-8,000 Coin + 2 Rương\n' +
                    '6️⃣-🔟 **Top 6-10**: 1,000-5,000 Coin + Bình Thể Lực\n\n' +
                    '_Dùng `/rank` để xem vị trí hiện tại của bạn._'
                )
                .setFooter({ text: 'Mở mỗi Thứ 6 lúc 13h — Hạn nhận: đến 13h Thứ 6 tuần sau' })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Rank announcement error:', error);
        }
    }
}

export async function handleReady(client: Client) {
    client.user?.setActivity('Nần ná na na anh Đặng Văn Tiến ,....', { type: ActivityType.Listening });

    setInterval(() => checkFridayAnnouncement(client), 60 * 1000);

    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
        const currentCommands = (client as any).commands.map((cmd: any) => cmd.data.toJSON());
        
        await rest.put(
             Routes.applicationCommands(client.user?.id!),
             { body: currentCommands }
        );
        
    } catch (error) {
        console.error("Command Registration Error:", error);
    }
}

