import { asRecord, displayValue } from './types';
import type { Job, Step, Workflow } from './types';

export function stepCategory(step: Step): string {
  const ref = step.actionRef?.toLowerCase() ?? '';
  if (ref.startsWith('actions/checkout@')) return 'checkout';
  if (ref.startsWith('actions/setup-')) return 'setup';
  if (typeof step.with.script === 'string') return 'terminal';
  if (ref.startsWith('appleboy/scp-action@')) return 'transfer';
  if (step.script && /\b(?:npm|pnpm|yarn)\s+(?:install|ci|run|test|build)\b/.test(step.script)) return 'package';
  return step.kind === 'run' ? 'terminal' : 'action';
}

export function stepSummary(step: Step, en: boolean): string {
  const category = stepCategory(step);
  if (category === 'checkout') return en ? 'Read the repository source with this action.' : 'Lấy mã nguồn repository qua action này.';
  if (category === 'setup') return en ? 'Prepare the toolchain using the declared action inputs.' : 'Chuẩn bị môi trường theo các input đã khai báo.';
  if (category === 'transfer') return en ? 'Transfer files using the action’s source and target inputs.' : 'Chuyển file theo source và target khai báo trong action.';
  if (step.kind === 'run') return en ? 'Run the declared script in this job’s runner.' : 'Chạy block script đã khai báo trên runner của job.';
  if (typeof step.with.script === 'string') return en ? 'Pass this script to an action. Its execution details depend on the action.' : 'Truyền script vào action. Cách thực hiện phụ thuộc action được gọi.';
  return en ? 'Invoke an action with the declared configuration.' : 'Gọi action với cấu hình đã khai báo.';
}

/** Declared lines, grouped for reading only; never new execution jobs or steps. */
export function scriptAnnotations(script: string, en: boolean): { label: string; lines: string[] }[] {
  const definitions = [
    { label: en ? 'Environment setup' : 'Chuẩn bị môi trường', pattern: /^\s*(?:export\s|.*\.nvm\/|if\s+!\s+command\s+-v|curl\s|sudo\s+(?:apt|npm\s+install\s+-g))/ },
    { label: en ? 'Working directory' : 'Thư mục làm việc', pattern: /^\s*cd\s/ },
    { label: en ? 'Install dependencies' : 'Cài dependencies', pattern: /^\s*(?:npm|pnpm|yarn)\s+(?:install|ci)\b/ },
    { label: en ? 'Database configuration' : 'Cấu hình dữ liệu', pattern: /^\s*(?:npx\s+prisma|chmod\s)/ },
    { label: en ? 'Application processes' : 'Tiến trình ứng dụng', pattern: /^\s*(?:pm2|docker|kubectl|systemctl)\s/ },
  ];
  const lines = script.split('\n');
  return definitions.map(d => ({ label: d.label, lines: lines.filter(line => d.pattern.test(line)).slice(0, 6) })).filter(d => d.lines.length > 0);
}

export function inheritedSettings(workflow: Workflow, job: Job, step?: Step) {
  const env = new Map<string, { value: unknown; origin: string }>();
  for (const [origin, data] of [['workflow', asRecord(workflow.settings.env)], ['job', asRecord(job.settings.env)], ['step', step?.env ?? {}]] as const) for (const [key, value] of Object.entries(data)) env.set(key, { value, origin });
  const defaults = { ...asRecord(asRecord(workflow.settings.defaults).run), ...asRecord(asRecord(job.settings.defaults).run), ...step?.settings };
  return { env: [...env].map(([key, binding]) => ({ key, ...binding })), defaults };
}
export function maskedConfig(value: unknown, key = ''): unknown {
  if (typeof value === 'string') return /token|secret|password|private.?key|api.?key|credential|^key$/i.test(key) && !value.includes('${{') ? '••••••••' : value;
  if (Array.isArray(value)) return value.map(v => maskedConfig(v, key));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, maskedConfig(v, k)]));
  return value;
}
export const formatConfig = (value: unknown) => displayValue(maskedConfig(value));
