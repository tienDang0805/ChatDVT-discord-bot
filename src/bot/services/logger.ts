import { prisma } from '../../database/prisma';

export class LoggerService {
  private static async logToDb(level: string, message: string, metadata?: any) {
    try {
      // Clean sensitive data if needed
      await prisma.systemLog.create({
        data: {
          level,
          message,
          metadata: metadata ? JSON.stringify(metadata) : null,
        }
      });
    } catch (e) {
      console.error(`[LoggerService] Failed to write to DB:`, e);
    }
  }

  static async info(message: string, metadata?: any) {
    console.log(`[INFO] ${message}`, metadata || '');
    await this.logToDb('info', message, metadata);
  }

  static async warn(message: string, metadata?: any) {
    console.warn(`[WARN] ${message}`, metadata || '');
    await this.logToDb('warn', message, metadata);
  }

  static async error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error);
    const meta = error instanceof Error ? { stack: error.stack, name: error.name, message: error.message } : error;
    await this.logToDb('error', message, meta);
  }

  static async debug(message: string, metadata?: any) {
    console.log(`[DEBUG] ${message}`, metadata || '');
    await this.logToDb('debug', message, metadata);
  }
}
