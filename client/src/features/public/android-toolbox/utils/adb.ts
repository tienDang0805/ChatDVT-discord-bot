import { Adb, AdbDaemonTransport } from '@yume-chan/adb';
import AdbWebCredentialStore from '@yume-chan/adb-credential-web';
import { AdbDaemonWebUsbDeviceManager } from '@yume-chan/adb-daemon-webusb';
import type { AdbDaemonWebUsbDevice } from '@yume-chan/adb-daemon-webusb';
import type { ReadableStream } from '@yume-chan/stream-extra';
import { commandFailure } from './commands.ts';

export const usbManager = AdbDaemonWebUsbDeviceManager.BROWSER;

export async function authenticate(device: AdbDaemonWebUsbDevice, signal: AbortSignal): Promise<Adb> {
  const closeUsb = () => { void device.raw.close().catch(() => {}); };
  signal.throwIfAborted();
  signal.addEventListener('abort', closeUsb, { once: true });
  try {
    const connection = await device.connect();
    signal.throwIfAborted();
    const transport = await AdbDaemonTransport.authenticate({
      serial: device.serial,
      connection,
      credentialStore: new AdbWebCredentialStore('Tiến Đặng Android Toolbox'),
    });
    if (signal.aborted) {
      await transport.close();
      signal.throwIfAborted();
    }
    const adb = new Adb(transport);
    if (!adb.subprocess.shellProtocol) {
      await adb.close();
      throw new Error('Thiết bị cần hỗ trợ ADB shell v2 (thường Android 7 trở lên).');
    }
    return adb;
  } catch (error) {
    await device.raw.close().catch(() => {});
    throw error;
  } finally {
    signal.removeEventListener('abort', closeUsb);
  }
}

async function readBytes(stream: ReadableStream<Uint8Array>, maxBytes: number): Promise<Uint8Array<ArrayBuffer>> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error('Kết quả quá lớn. Hãy giảm phạm vi log và thử lại.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const output = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.byteLength; }
  return output;
}

/** All arguments are quoted: Tango joins argument arrays into an Android shell command. */
export function shellArguments(args: readonly string[]): string[] {
  return args.map(arg => `'${arg.replace(/'/g, "'\\''")}'`);
}

export async function runShell(adb: Adb, args: readonly string[], signal: AbortSignal, binary = false) {
  const shell = adb.subprocess.shellProtocol;
  if (!shell) throw new Error('Thiết bị không hỗ trợ shell v2.');
  const process = await shell.spawn(shellArguments(args), signal);
  try {
    // Drain stdout AND stderr together; an unread ADB stream blocks the entire connection.
    const [bytes, errorBytes, exitCode] = await Promise.all([
      readBytes(process.stdout, binary ? 24 * 1024 * 1024 : 2 * 1024 * 1024),
      readBytes(process.stderr, 256 * 1024),
      process.exited,
    ]);
    signal.throwIfAborted();
    const stdout = binary ? '' : new TextDecoder().decode(bytes);
    const stderr = new TextDecoder().decode(errorBytes);
    const failure = commandFailure(stdout, stderr, exitCode);
    if (failure) throw new Error(failure);
    return { bytes, text: [stdout, stderr].filter(Boolean).join('\n').trim() };
  } finally {
    await process.kill();
  }
}

export function isPng(bytes: Uint8Array): boolean {
  return [137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => bytes[i] === byte);
}
