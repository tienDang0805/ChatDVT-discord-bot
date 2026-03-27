// Note: Node 18+ natively supports fetch and ReadableStream
// Inject Polyfill just in case the execution environment uses < 18 or strips it natively.
import fetch, { Headers, Request, Response } from 'node-fetch';
const g = global as any;
if (!g.fetch) {
  g.fetch = fetch;
  g.Headers = Headers;
  g.Request = Request;
  g.Response = Response;
}

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
