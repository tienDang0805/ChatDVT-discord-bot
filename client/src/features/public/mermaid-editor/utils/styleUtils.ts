export interface NodeStyle {
  fill: string;
  stroke: string;
  color: string;
  strokeWidth: string;
}

export interface ParsedBlock {
  id: string;
  type: 'markdown' | 'mermaid';
  content: string;
  index: number;
}

export function parseMarkdownBlocks(md: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const regex = /```mermaid\s*\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = regex.exec(md)) !== null) {
    const before = md.slice(lastIndex, match.index).trim();
    if (before) {
      blocks.push({ id: `md-${idx}`, type: 'markdown', content: before, index: idx++ });
    }
    blocks.push({ id: `mermaid-${idx}`, type: 'mermaid', content: match[1].trim(), index: idx++ });
    lastIndex = match.index + match[0].length;
  }

  const after = md.slice(lastIndex).trim();
  if (after) {
    blocks.push({ id: `md-${idx}`, type: 'markdown', content: after, index: idx });
  }

  return blocks;
}

export function blocksToMarkdown(blocks: ParsedBlock[]): string {
  return blocks
    .map(b => (b.type === 'mermaid' ? '```mermaid\n' + b.content + '\n```' : b.content))
    .join('\n\n');
}

export function parseNodeStyles(code: string): Map<string, NodeStyle> {
  const map = new Map<string, NodeStyle>();
  const lines = code.split('\n');
  for (const line of lines) {
    const m = line.trim().match(/^style\s+(\w+)\s+(.+)$/);
    if (!m) continue;
    const nodeId = m[1];
    const props = m[2];
    const style: NodeStyle = { fill: '#ffffff', stroke: '#333333', color: '#000000', strokeWidth: '2' };
    const fillM = props.match(/fill:(#[0-9a-fA-F]{3,8})/);
    const strokeM = props.match(/stroke:(#[0-9a-fA-F]{3,8})/);
    const colorM = props.match(/color:(#[0-9a-fA-F]{3,8})/);
    const swM = props.match(/stroke-width:(\d+)/);
    if (fillM) style.fill = fillM[1];
    if (strokeM) style.stroke = strokeM[1];
    if (colorM) style.color = colorM[1];
    if (swM) style.strokeWidth = swM[1];
    map.set(nodeId, style);
  }
  return map;
}

export function applyNodeStyle(code: string, nodeId: string, style: NodeStyle): string {
  const styleLine = `    style ${nodeId} fill:${style.fill},stroke:${style.stroke},color:${style.color},stroke-width:${style.strokeWidth}`;
  const lines = code.split('\n');
  const existingIdx = lines.findIndex(l => l.trim().startsWith(`style ${nodeId} `));
  if (existingIdx >= 0) {
    lines[existingIdx] = styleLine;
  } else {
    lines.push(styleLine);
  }
  return lines.join('\n');
}

export function removeNodeStyle(code: string, nodeId: string): string {
  return code
    .split('\n')
    .filter(l => !l.trim().startsWith(`style ${nodeId} `))
    .join('\n');
}

export function extractNodeIds(code: string): string[] {
  const ids = new Set<string>();
  const lines = code.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('style ') || trimmed.startsWith('classDef') || trimmed.startsWith('subgraph') || !trimmed) continue;

    const nodePatterns = [
      /([A-Za-z_]\w*)\s*[\[({]/g,
      /-->\s*\|?[^|]*\|?\s*([A-Za-z_]\w*)/g,
      /([A-Za-z_]\w*)\s*-->/g,
      /([A-Za-z_]\w*)\s*->>>/g,
    ];
    for (const pat of nodePatterns) {
      let m: RegExpExecArray | null;
      while ((m = pat.exec(trimmed)) !== null) {
        const id = m[1];
        if (!['graph', 'flowchart', 'subgraph', 'end', 'direction', 'participant', 'TD', 'TB', 'LR', 'RL', 'BT'].includes(id)) {
          ids.add(id);
        }
      }
    }
  }
  return Array.from(ids);
}

export function getNodeLabel(code: string, nodeId: string): string {
  const patterns = [
    new RegExp(`${nodeId}\\s*\\["([^"]*)"\\]`),
    new RegExp(`${nodeId}\\s*\\[([^\\]]*?)\\]`),
    new RegExp(`${nodeId}\\s*\\("([^"]*)"\\)`),
    new RegExp(`${nodeId}\\s*\\(([^)]*?)\\)`),
    new RegExp(`${nodeId}\\s*\\{"([^"]*)"\\}`),
    new RegExp(`${nodeId}\\s*\\{([^}]*?)\\}`),
    new RegExp(`${nodeId}\\s*\\(\\("([^"]*)"\\)\\)`),
    new RegExp(`${nodeId}\\s*\\(\\(([^)]*?)\\)\\)`),
  ];
  for (const p of patterns) {
    const m = code.match(p);
    if (m) return m[1];
  }
  return nodeId;
}

export function updateNodeLabel(code: string, nodeId: string, newLabel: string): string {
  const patterns = [
    { regex: new RegExp(`(${nodeId}\\s*\\[")([^"]*?)("\\])`), replacement: `$1${newLabel}$3` },
    { regex: new RegExp(`(${nodeId}\\s*\\[)([^\\]]*?)(\\])`), replacement: `$1${newLabel}$3` },
    { regex: new RegExp(`(${nodeId}\\s*\\(")([^"]*?)("\\))`), replacement: `$1${newLabel}$3` },
    { regex: new RegExp(`(${nodeId}\\s*\\()([^)]*?)(\\))`), replacement: `$1${newLabel}$3` },
    { regex: new RegExp(`(${nodeId}\\s*\\{")([^"]*?)("\\})`), replacement: `$1${newLabel}$3` },
    { regex: new RegExp(`(${nodeId}\\s*\\{)([^}]*?)(\\})`), replacement: `$1${newLabel}$3` },
  ];
  for (const { regex, replacement } of patterns) {
    if (regex.test(code)) {
      return code.replace(regex, replacement);
    }
  }
  return code;
}

export const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#2563eb', '#64748b', '#1e293b',
  '#ffffff', '#f1f5f9', '#cbd5e1', '#334155',
];
