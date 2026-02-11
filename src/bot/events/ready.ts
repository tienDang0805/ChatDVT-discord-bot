import { Client, ActivityType, Routes, REST } from 'discord.js';
import fs from 'fs';
import path from 'path';

export async function handleReady(client: Client) {
    console.log(`✅ Logged in as ${client.user?.tag}!`);
    console.log(`🆔 Bot ID: ${client.user?.id}`);

    client.user?.setActivity('Waiting for user input...', { type: ActivityType.Listening });

    // --- Command Registration ---
    // Note: Usually better to do this in a separate deploy script or here on startup
    try {
        const commands = [];
        const commandsPath = path.join(__dirname, '../commands');
        
        // Ensure directory exists
        if (fs.existsSync(commandsPath)) {
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
            
            for (const file of commandFiles) {
                // Dynamic import might be needed or simple require
                // In TS compiled environment, this can be tricky.
                // For now, simpler to manually import or assume pre-registered collection.
                // Let's rely on client.ts loading them into a collection, 
                // and here we just register to Discord API.
                
                // Assuming client.commands is populated in Client constructor or init
                // access client.commands
            }
        }
        
        // For Hybrid Monolith, let's just register manually via a deploy method or check `client` has commands.
        // We will implement `deployCommands` in `client.ts` and call it there? 
        // Or do it here.
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
        const currentCommands = (client as any).commands.map((cmd: any) => cmd.data.toJSON());
        
        // Global Registration
        await rest.put(
             Routes.applicationCommands(client.user?.id!),
             { body: currentCommands }
        );
        console.log(`✅ Successfully registered ${currentCommands.length} global commands.`);
        
    } catch (error) {
        console.error("Command Registration Error:", error);
    }
}
