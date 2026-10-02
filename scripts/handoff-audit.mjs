// Staged-file safety check. Reports paths/rule names, never secret values.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const git = (...args) => execFileSync('git', args, {encoding: 'utf8', maxBuffer: 32 * 1024 * 1024});
const files = git('diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z').split('\0').filter(Boolean);
const knownSecrets = [];
if (fs.existsSync('.env')) {
  const env = require('dotenv').parse(fs.readFileSync('.env'));
  for (const [name, value] of Object.entries(env)) {
    if (/(TOKEN|SECRET|PASSWORD|API.?KEY|WEBHOOK)/i.test(name) && value.length >= 12) knownSecrets.push(value);
  }
}
const rules = [
  ['Google API key', /AIza[0-9A-Za-z_-]{35}/],
  ['GitHub token', /(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})/],
  ['Private key material', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['Discord bot token', /[MN][A-Za-z0-9_-]{23,}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}/],
  ['Discord webhook credential', /https:\/\/(?:discord(?:app)?\.com)\/api\/webhooks\/\d+\/[A-Za-z0-9_-]{30,}/],
];
const findings = [];
let textFiles = 0;
for (const file of files) {
  const base = file.split('/').at(-1);
  if ((base.startsWith('.env') && base !== '.env.example') || /\.(?:db|sqlite3?)(?:-(?:wal|shm|journal))?$/.test(base)) {
    findings.push({file, rule: 'Private environment/database file'});
  }
  const bytes = execFileSync('git', ['show', ':' + file], {maxBuffer: 128 * 1024 * 1024});
  if (bytes.length > 100 * 1024 * 1024) findings.push({file, rule: 'GitHub file-size limit'});
  if (bytes.includes(0)) continue;
  textFiles++;
  const content = bytes.toString('utf8');
  if (knownSecrets.some(secret => content.includes(secret))) findings.push({file, rule: 'Matches a local credential (value withheld)'});
  for (const [rule, pattern] of rules) if (pattern.test(content)) findings.push({file, rule});
}
console.log(JSON.stringify({stagedFiles: files.length, textFiles, findings, note: 'Heuristic check, not a proof that all history/binary assets are secret-free.'}, null, 2));
if (findings.length) process.exitCode = 1;
