import { Client, GatewayIntentBits, Collection, Partials } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { handleInteraction } from './events/interactionCreate';
import { messageCreate } from './events/messageCreate';
import { handleReady } from './events/ready';

export class BotClient extends Client {
  public commands: Collection<string, any>;

  constructor() {
    super({
      intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMembers, // For UserIdentity
          GatewayIntentBits.GuildPresences
      ],
      partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember]
    });
    this.commands = new Collection();
  }

  public async loadCommands() {
      const commandsPath = path.join(__dirname, 'commands');
      if (fs.existsSync(commandsPath)) {
          const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
          
          for (const file of commandFiles) {
              const filePath = path.join(commandsPath, file);
              // Dynamic import
              const command = await import(filePath);
              
              if ('data' in command && 'execute' in command) {
                  this.commands.set(command.data.name, command);
                  // console.log(`[Command] Loaded ${command.data.name}`);
              } else {
                  console.warn(`[Command] Warning: The command at ${filePath} is missing "data" or "execute" property.`);
              }
          }
      }
  }

  public async start(token: string) {
      // Load Commands
      await this.loadCommands();

      // Register Events
      this.on('interactionCreate', handleInteraction);
      this.on('messageCreate', messageCreate);
      this.on('ready', handleReady);
      
      this.on('error', (error) => {
           console.error('Discord Client Error:', error);
      });

      await this.login(token);
  }
}

export const bot = new BotClient();
