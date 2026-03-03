// Note: Node 18+ natively supports fetch and ReadableStream
// Do not override global fetch with node-fetch to avoid deadlock on Linux.

import { bot } from './bot/client';
import { startApiServer } from './api/server';
import './config/constants'; // Load env/constants
import { prisma } from './database/prisma'; // Initialize Prisma

async function main() {
  try {
    // 1. Start API Server (Dashboard)
    startApiServer();

    // 2. Start Discord Bot
    await bot.start(process.env.DISCORD_TOKEN!);
    
    console.log("✅ System started successfully.");
    
  } catch (error) {
    console.error('Fatal Error during startup:', error);
    process.exit(1);
  }
}

main();
