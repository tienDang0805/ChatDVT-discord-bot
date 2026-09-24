import assert from 'node:assert/strict';
import { test } from 'node:test';
import { appCommand, commandFailure, metroCommand, packageId } from './utils/commands.ts';
import { isPng, runShell, shellArguments } from './utils/adb.ts';

test('rejects shell injection in package and permission inputs', () => {
  for (const pkg of ['com.app;reboot', 'com.app\nreboot', '$(id)', '-p', '']) {
    assert.throws(() => packageId(pkg));
  }
  assert.deepEqual(appCommand('stop', ' com.example.app '), ['am', 'force-stop', 'com.example.app']);
  assert.throws(() => appCommand('grant', 'com.example.app', 'CAMERA;reboot'));
  assert.deepEqual(shellArguments(['a b', "a'b", '$(id)']), ["'a b'", "'a'\\''b'", "'$(id)'"]);
});

test('validates Metro ports and quotes USB serials', () => {
  for (const port of ['0', '65536', '8081;id', '8e3', '-1']) assert.throws(() => metroCommand('phone', port));
  assert.equal(metroCommand("a'b", '8081'), "adb -s 'a'\\''b' reverse tcp:8081 tcp:8081");
});

test('does not report success for Android utility failures with zero exit code', () => {
  for (const output of ['Failure [not installed]', 'Error: unknown package', '** No activities found to run, monkey aborted.', 'Exception occurred while executing:']) {
    assert.equal(commandFailure(output, '', 0), output);
  }
  assert.equal(commandFailure('Success', '', 0), undefined);
  assert.equal(commandFailure('', 'permission denied', 1), 'permission denied');
});

function mockAdb(stdout, stderr = '', exitCode = 0) {
  let killed = false;
  let received;
  const bytes = value => value instanceof Uint8Array ? value : new TextEncoder().encode(value);
  const stream = value => new ReadableStream({ start(controller) { controller.enqueue(bytes(value)); controller.close(); } });
  return {
    adb: { subprocess: { shellProtocol: { spawn: async (args, signal) => {
      signal.throwIfAborted(); received = args;
      return { stdout: stream(stdout), stderr: stream(stderr), exited: Promise.resolve(exitCode), kill() { killed = true; } };
    } } } },
    get killed() { return killed; }, get received() { return received; },
  };
}

test('reads output and stderr, checks exit code, and closes the process', async () => {
  const success = mockAdb('Success\n');
  assert.equal((await runShell(success.adb, ['pm', 'clear', 'com.app'], new AbortController().signal)).text, 'Success');
  assert.deepEqual(success.received, ["'pm'", "'clear'", "'com.app'"]);
  assert.ok(success.killed);
  const failed = mockAdb('', 'SecurityException: not allowed', 1);
  await assert.rejects(runShell(failed.adb, ['pm'], new AbortController().signal), /SecurityException/);
  assert.ok(failed.killed);
});

test('preserves binary screenshots and rejects non-PNG data', async () => {
  const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 255]);
  const result = await runShell(mockAdb(png).adb, ['screencap', '-p'], new AbortController().signal, true);
  assert.deepEqual(result.bytes, png);
  assert.ok(isPng(result.bytes));
  assert.equal(isPng(new TextEncoder().encode('error')), false);
});

test('limits text output and releases the process on failure', async () => {
  const device = mockAdb(new Uint8Array(2 * 1024 * 1024 + 1));
  await assert.rejects(runShell(device.adb, ['logcat'], new AbortController().signal), /quá lớn/);
  assert.ok(device.killed);
});

test('does not execute an already aborted action', async () => {
  const controller = new AbortController(); controller.abort(new Error('cancelled'));
  const device = mockAdb('Success');
  await assert.rejects(runShell(device.adb, ['pm'], controller.signal), /cancelled/);
  assert.equal(device.received, undefined);
});
