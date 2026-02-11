import { Message, TextChannel, ChatInputCommandInteraction, InteractionResponse } from 'discord.js';

type ReplyMethod = (options: any) => Promise<Message | InteractionResponse>;

export async function sendLongMessage(
    replyMethod: ReplyMethod, 
    content: string, 
    options: any = {}
): Promise<Message | InteractionResponse | void> {
    const maxLength = 1900;
    if (content.length <= maxLength) {
        return await replyMethod({ content, ...options });
    }

    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += maxLength) {
        chunks.push(content.substring(i, i + maxLength));
    }
    
    // Send first chunk with reply logic
    const firstChunkOptions = {
        ...options,
        content: chunks[0]
    };
    
    // This part is tricky with types, assuming replyMethod returns a Message-like object that has 'channel'
    const firstMessage = await replyMethod(firstChunkOptions);

    let channel: any;
    if ('channel' in firstMessage) {
        channel = firstMessage.channel;
    } else if ('interaction' in firstMessage && firstMessage.interaction) {
        channel = firstMessage.interaction.channel;
    } else {
        // Fallback if we can't determine channel (rare)
        return; 
    }

    if (!channel || !channel.send) return;

    // Send remaining chunks
    for (let i = 1; i < chunks.length; i++) {
        await channel.send(chunks[i]);
    }   
}
