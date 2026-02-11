// @ts-ignore
import { ReadableStream } from 'web-streams-polyfill/ponyfill';
// @ts-ignore
globalThis.ReadableStream = ReadableStream;

import fetch from 'node-fetch';
// @ts-ignore
if (!globalThis.fetch) {
    // @ts-ignore
    globalThis.fetch = fetch;
    // @ts-ignore
    globalThis.Headers = fetch.Headers;
    // @ts-ignore
    globalThis.Request = fetch.Request;
    // @ts-ignore
    globalThis.Response = fetch.Response;
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
