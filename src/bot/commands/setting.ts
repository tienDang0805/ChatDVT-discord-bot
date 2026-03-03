import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } from 'discord.js';
import { prisma } from '../../database/prisma';

export const data = new SlashCommandBuilder()
    .setName('setting')
    .setDescription('Cấu hình nhân cách (Persona) của Bot trong máy chủ này.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addSubcommand(subcommand =>
        subcommand.setName('view')
            .setDescription('Xem nhân cách hiện tại của Bot trong máy chủ này.')
    )
    .addSubcommand(subcommand =>
        subcommand.setName('edit')
            .setDescription('Mở bảng thông tin để sửa nhân cách của Bot.')
    )
    .addSubcommand(subcommand =>
        subcommand.setName('reset')
            .setDescription('Khôi phục nhân cách của Bot về thiết lập mặc định (Global).')
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    if (!guildId) {
        return interaction.reply({ content: 'Lệnh này chỉ dùng được trong server.', ephemeral: true });
    }

    // --- Lấy Persona Config ---
    let personaData = null;
    let isGlobal = true;

    // 1. Check Guild Persona
    const guildConfig = await prisma.guildConfig.findUnique({ where: { guildId } });
    if (guildConfig) {
        try {
            const modules = JSON.parse(guildConfig.activeModules);
            if (modules.persona) {
                personaData = modules.persona;
                isGlobal = false;
            }
        } catch (e) {}
    }

    // 2. Nếu không có, Check Global Persona
    if (!personaData) {
        const globalConfig = await prisma.botConfig.findUnique({ where: { key: 'persona' } });
        if (globalConfig) {
            try {
                personaData = JSON.parse(globalConfig.systemPrompts);
            } catch (e) {}
        }
    }

    // 3. Fallback Mặc định nếu DB trống rỗng
    if (!personaData) {
        personaData = {
            identity: "Tôi là trợ lý AI ảo.",
            purpose: "Hỗ trợ người dùng trong server giải trí.",
            hobbies: "Thích đọc sách.",
            personality: "Thân thiện, vui vẻ.",
            writing_style: "Ngắn gọn, súc tích."
        };
    }

    // --- Xử lý Lệnh: /setting view ---
    if (subcommand === 'view') {
        const embed = new EmbedBuilder()
            .setTitle(`🤖 Nhân Cách Của Bot (Bot Persona)`)
            .setDescription(`Cấu hình hiện tại đang dùng: **${isGlobal ? '🌍 Dùng Chung (Global)' : '🏠 Tuỳ Chỉnh Riêng Server'}**\n*Sử dụng \`/setting edit\` để thay đổi.*`)
            .setColor(isGlobal ? '#3498db' : '#2ecc71')
            .addFields(
                { name: '👤 Danh tính (Bot là ai?)', value: personaData.identity || 'Trống', inline: false },
                { name: '🎯 Mục đích (Làm gì?)', value: personaData.purpose || 'Trống', inline: false },
                { name: '🎮 Sở thích', value: personaData.hobbies || 'Trống', inline: false },
                { name: '🎭 Tính cách', value: personaData.personality || 'Trống', inline: false },
                { name: '✍️ Giọng văn', value: personaData.writing_style || 'Trống', inline: false }
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // --- Xử lý Lệnh: /setting edit ---
    if (subcommand === 'edit') {
        const modal = new ModalBuilder()
            .setCustomId('persona_setting_modal')
            .setTitle('Cấu Hình Nhân Cách Bot');

        const identityInput = new TextInputBuilder()
            .setCustomId('persona_identity')
            .setLabel("Danh tính (Bạn là ai?)")
            .setStyle(TextInputStyle.Short)
            .setValue(personaData.identity || '')
            .setRequired(false);

        const purposeInput = new TextInputBuilder()
            .setCustomId('persona_purpose')
            .setLabel("Mục đích (Bạn làm gì?)")
            .setStyle(TextInputStyle.Short)
            .setValue(personaData.purpose || '')
            .setRequired(false);

        const hobbiesInput = new TextInputBuilder()
            .setCustomId('persona_hobbies')
            .setLabel("Sở thích (Bạn thích gì?)")
            .setStyle(TextInputStyle.Short)
            .setValue(personaData.hobbies || '')
            .setRequired(false);

        const personalityInput = new TextInputBuilder()
            .setCustomId('persona_personality')
            .setLabel("Tính cách (Thân thiện, cọc cằn...)")
            .setStyle(TextInputStyle.Short)
            .setValue(personaData.personality || '')
            .setRequired(false);

        const styleInput = new TextInputBuilder()
            .setCustomId('persona_style')
            .setLabel("Giọng văn (Cách nói chuyện, emoji...)")
            .setStyle(TextInputStyle.Paragraph)
            .setValue(personaData.writing_style || '')
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(identityInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(purposeInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(hobbiesInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(personalityInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(styleInput)
        );

        return interaction.showModal(modal);
    }

    // --- Xử lý Lệnh: /setting reset ---
    if (subcommand === 'reset') {
        if (!isGlobal) {
            // Xoá config Persona trong GuildConfig
            try {
                const guildConfig = await prisma.guildConfig.findUnique({ where: { guildId } });
                 if (guildConfig) {
                     const modules = JSON.parse(guildConfig.activeModules);
                     delete modules.persona; // Xoá trường persona
                     
                     await prisma.guildConfig.update({
                         where: { guildId },
                         data: { activeModules: JSON.stringify(modules) }
                     });
                 }
                 return interaction.reply({ content: '✅ Đã khôi phục Nhân Cách của Bot về mặc định (Global) cho máy chủ này!', ephemeral: true });
            } catch (error) {
                 console.error("Reset Persona Error:", error);
                 return interaction.reply({ content: '❌ Có lỗi khi khôi phục.', ephemeral: true });
            }
        } else {
            return interaction.reply({ content: 'Máy chủ này vốn dĩ đã đang dùng thiết lập Mặc Định (Global).', ephemeral: true });
        }
    }
}
