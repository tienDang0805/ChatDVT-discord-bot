export type ShapeType = 'rect' | 'rounded' | 'diamond' | 'circle' | 'cylinder' | 'hexagon' | 'stadium' | 'subroutine';
export type ArrowType = 'arrow' | 'line' | 'dotted' | 'thick';
export interface DiagramNode { id: string; label: string; shape: ShapeType; }
export interface ShapeDef { type: ShapeType; label: string; icon: string; wrap: (id: string, text: string) => string; }
export interface ArrowDef { type: ArrowType; label: string; icon: string; syntax: string; }

export const SHAPES: ShapeDef[] = [
  { type: 'rect', label: 'Rectangle', icon: '▭', wrap: (id, t) => `${id}["${t}"]` },
  { type: 'rounded', label: 'Rounded', icon: '⬭', wrap: (id, t) => `${id}("${t}")` },
  { type: 'diamond', label: 'Diamond', icon: '◇', wrap: (id, t) => `${id}{"${t}"}` },
  { type: 'circle', label: 'Circle', icon: '○', wrap: (id, t) => `${id}(("${t}"))` },
  { type: 'cylinder', label: 'Database', icon: '⛁', wrap: (id, t) => `${id}[("${t}")]` },
  { type: 'hexagon', label: 'Hexagon', icon: '⬡', wrap: (id, t) => `${id}{{"${t}"}}` },
  { type: 'stadium', label: 'Stadium', icon: '⏺', wrap: (id, t) => `${id}(["${t}"])` },
  { type: 'subroutine', label: 'Subroutine', icon: '⊞', wrap: (id, t) => `${id}[["${t}"]]` },
];

export const ARROWS: ArrowDef[] = [
  { type: 'arrow', label: 'Arrow', icon: '→', syntax: '-->' },
  { type: 'line', label: 'Line', icon: '—', syntax: '---' },
  { type: 'dotted', label: 'Dotted', icon: '⋯→', syntax: '-.->' },
  { type: 'thick', label: 'Thick', icon: '⇒', syntax: '==>' },
];

export function getChartType(code: string): string {
  const first = code.trim().split('\n')[0].trim().toLowerCase();
  if (first.startsWith('graph') || first.startsWith('flowchart')) return 'flowchart';
  if (first.startsWith('sequencediagram')) return 'sequence';
  if (first.startsWith('classdiagram')) return 'class';
  if (first.startsWith('statediagram')) return 'state';
  if (first.startsWith('erdiagram')) return 'er';
  if (first.startsWith('gantt')) return 'gantt';
  if (first.startsWith('pie')) return 'pie';
  if (first.startsWith('mindmap')) return 'mindmap';
  if (first.startsWith('gitgraph')) return 'git';
  return 'unknown';
}

export interface ComponentField { name: string; label: string; placeholder: string; type?: 'text' | 'select'; options?: { value: string; label: string }[]; }
export interface DiagramComponent { id: string; label: string; icon: string; fields: ComponentField[]; generate: (v: Record<string, string>) => string; }

const SEQ_ARROWS = [
  { value: '->>', label: 'Solid + Arrow' },
  { value: '-->>', label: 'Dotted + Arrow' },
  { value: '->',  label: 'Solid' },
  { value: '-->',  label: 'Dotted' },
  { value: '-x',   label: 'Cross' },
  { value: '--x',  label: 'Dotted Cross' },
];

const STATE_ARROWS = [
  { value: '-->', label: 'Transition' },
];

const ER_RELS = [
  { value: '||--o{', label: '1 → N' },
  { value: '||--|{', label: '1 → N (required)' },
  { value: '}o--o{', label: 'N → N' },
  { value: '||--||', label: '1 → 1' },
];

const CLASS_RELS = [
  { value: '--|>', label: 'Inheritance' },
  { value: '--*', label: 'Composition' },
  { value: '--o', label: 'Aggregation' },
  { value: '-->', label: 'Association' },
  { value: '..>', label: 'Dependency' },
  { value: '..|>', label: 'Realization' },
];

export function getComponents(chartType: string): DiagramComponent[] {
  switch (chartType) {
    case 'flowchart': return [
      { id: 'fc-node', label: 'Node', icon: '▭', fields: [
        { name: 'label', label: 'Tên', placeholder: 'Tên node...' },
        { name: 'shape', label: 'Hình', placeholder: '', type: 'select', options: SHAPES.map(s => ({ value: s.type, label: `${s.icon} ${s.label}` })) },
      ], generate: v => { const s = SHAPES.find(x => x.type === v.shape) || SHAPES[0]; return `    ${genId('N')}${s.wrap('', v.label).slice(0)}`; } },
      { id: 'fc-conn', label: 'Kết nối', icon: '→', fields: [
        { name: 'from', label: 'Từ', placeholder: 'Node ID...' },
        { name: 'to', label: 'Đến', placeholder: 'Node ID...' },
        { name: 'arrow', label: 'Loại', type: 'select', placeholder: '', options: ARROWS.map(a => ({ value: a.syntax, label: `${a.icon} ${a.label}` })) },
        { name: 'text', label: 'Nhãn', placeholder: '(tùy chọn)' },
      ], generate: v => v.text ? `    ${v.from} ${v.arrow}|"${v.text}"| ${v.to}` : `    ${v.from} ${v.arrow} ${v.to}` },
      { id: 'fc-sub', label: 'Subgraph', icon: '📦', fields: [
        { name: 'label', label: 'Tên group', placeholder: 'Tên group...' },
      ], generate: v => `    subgraph ${v.label.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}["${v.label}"]\n        direction TB\n    end` },
    ];

    case 'sequence': return [
      { id: 'sq-part', label: 'Participant', icon: '👤', fields: [
        { name: 'id', label: 'ID', placeholder: 'VD: U' },
        { name: 'alias', label: 'Tên hiển thị', placeholder: 'VD: User' },
      ], generate: v => v.alias ? `    participant ${v.id} as ${v.alias}` : `    participant ${v.id}` },
      { id: 'sq-actor', label: 'Actor', icon: '🧑', fields: [
        { name: 'id', label: 'ID', placeholder: 'VD: U' },
        { name: 'alias', label: 'Tên hiển thị', placeholder: 'VD: User' },
      ], generate: v => v.alias ? `    actor ${v.id} as ${v.alias}` : `    actor ${v.id}` },
      { id: 'sq-msg', label: 'Message', icon: '💬', fields: [
        { name: 'from', label: 'Từ', placeholder: 'Participant ID' },
        { name: 'to', label: 'Đến', placeholder: 'Participant ID' },
        { name: 'arrow', label: 'Loại', type: 'select', placeholder: '', options: SEQ_ARROWS },
        { name: 'text', label: 'Nội dung', placeholder: 'Message...' },
      ], generate: v => `    ${v.from}${v.arrow}${v.to}: ${v.text}` },
      { id: 'sq-note', label: 'Note', icon: '📝', fields: [
        { name: 'pos', label: 'Vị trí', type: 'select', placeholder: '', options: [
          { value: 'right of', label: 'Bên phải' }, { value: 'left of', label: 'Bên trái' }, { value: 'over', label: 'Phía trên' },
        ]},
        { name: 'target', label: 'Target', placeholder: 'Participant ID' },
        { name: 'text', label: 'Nội dung', placeholder: 'Ghi chú...' },
      ], generate: v => `    Note ${v.pos} ${v.target}: ${v.text}` },
      { id: 'sq-loop', label: 'Loop', icon: '🔄', fields: [
        { name: 'cond', label: 'Điều kiện', placeholder: 'VD: Every 60s' },
      ], generate: v => `    loop ${v.cond}\n    end` },
      { id: 'sq-alt', label: 'Alt/Else', icon: '🔀', fields: [
        { name: 'cond1', label: 'Điều kiện 1', placeholder: 'VD: Success' },
        { name: 'cond2', label: 'Điều kiện 2', placeholder: 'VD: Failure' },
      ], generate: v => `    alt ${v.cond1}\n    else ${v.cond2}\n    end` },
      { id: 'sq-rect', label: 'Highlight', icon: '🟨', fields: [
        { name: 'color', label: 'Màu', placeholder: 'VD: rgb(200,255,200)' },
      ], generate: v => `    rect ${v.color || 'rgb(200,255,200)'}\n    end` },
    ];

    case 'state': return [
      { id: 'st-state', label: 'State', icon: '⬜', fields: [
        { name: 'id', label: 'ID', placeholder: 'VD: Active' },
        { name: 'desc', label: 'Mô tả', placeholder: '(tùy chọn)' },
      ], generate: v => v.desc ? `    state "${v.desc}" as ${v.id}` : `    ${v.id}` },
      { id: 'st-trans', label: 'Transition', icon: '→', fields: [
        { name: 'from', label: 'Từ', placeholder: 'State ID hoặc [*]' },
        { name: 'to', label: 'Đến', placeholder: 'State ID hoặc [*]' },
        { name: 'label', label: 'Nhãn', placeholder: '(tùy chọn)' },
      ], generate: v => v.label ? `    ${v.from} --> ${v.to}: ${v.label}` : `    ${v.from} --> ${v.to}` },
      { id: 'st-note', label: 'Note', icon: '📝', fields: [
        { name: 'pos', label: 'Vị trí', type: 'select', placeholder: '', options: [
          { value: 'right of', label: 'Bên phải' }, { value: 'left of', label: 'Bên trái' },
        ]},
        { name: 'target', label: 'State ID', placeholder: 'VD: Active' },
        { name: 'text', label: 'Nội dung', placeholder: 'Ghi chú...' },
      ], generate: v => `    note ${v.pos} ${v.target}: ${v.text}` },
      { id: 'st-fork', label: 'Fork/Join', icon: '⑂', fields: [
        { name: 'id', label: 'ID', placeholder: 'VD: fork1' },
        { name: 'type', label: 'Loại', type: 'select', placeholder: '', options: [
          { value: 'fork', label: 'Fork' }, { value: 'join', label: 'Join' },
        ]},
      ], generate: v => `    state ${v.id} <<${v.type}>>` },
      { id: 'st-composite', label: 'Composite', icon: '📦', fields: [
        { name: 'id', label: 'State ID', placeholder: 'VD: Active' },
      ], generate: v => `    state ${v.id} {\n        [*] --> Inner\n    }` },
    ];

    case 'er': return [
      { id: 'er-entity', label: 'Entity', icon: '📋', fields: [
        { name: 'name', label: 'Tên', placeholder: 'VD: users' },
        { name: 'attrs', label: 'Attributes (1/dòng)', placeholder: 'string name\nint age' },
      ], generate: v => {
        const attrs = v.attrs.split('\n').filter(Boolean).map(a => `        ${a.trim()}`).join('\n');
        return attrs ? `    ${v.name} {\n${attrs}\n    }` : `    ${v.name} {\n    }`;
      }},
      { id: 'er-rel', label: 'Relationship', icon: '🔗', fields: [
        { name: 'from', label: 'Entity A', placeholder: 'VD: users' },
        { name: 'to', label: 'Entity B', placeholder: 'VD: orders' },
        { name: 'rel', label: 'Quan hệ', type: 'select', placeholder: '', options: ER_RELS },
        { name: 'label', label: 'Nhãn', placeholder: 'VD: has' },
      ], generate: v => `    ${v.from} ${v.rel} ${v.to} : "${v.label}"` },
    ];

    case 'class': return [
      { id: 'cl-class', label: 'Class', icon: '📦', fields: [
        { name: 'name', label: 'Tên class', placeholder: 'VD: Animal' },
        { name: 'attrs', label: 'Attributes', placeholder: '+String name\n+int age' },
        { name: 'methods', label: 'Methods', placeholder: '+eat()\n+sleep()' },
      ], generate: v => {
        const lines = [`    class ${v.name} {`];
        v.attrs.split('\n').filter(Boolean).forEach(a => lines.push(`        ${a.trim()}`));
        v.methods.split('\n').filter(Boolean).forEach(m => lines.push(`        ${m.trim()}`));
        lines.push('    }');
        return lines.join('\n');
      }},
      { id: 'cl-rel', label: 'Relationship', icon: '🔗', fields: [
        { name: 'from', label: 'Class A', placeholder: 'VD: Animal' },
        { name: 'to', label: 'Class B', placeholder: 'VD: Dog' },
        { name: 'rel', label: 'Loại', type: 'select', placeholder: '', options: CLASS_RELS },
        { name: 'label', label: 'Nhãn', placeholder: '(tùy chọn)' },
      ], generate: v => v.label ? `    ${v.from} ${v.rel} ${v.to} : ${v.label}` : `    ${v.from} ${v.rel} ${v.to}` },
      { id: 'cl-note', label: 'Annotation', icon: '📝', fields: [
        { name: 'target', label: 'Class', placeholder: 'VD: Animal' },
        { name: 'anno', label: 'Annotation', placeholder: 'VD: interface' },
      ], generate: v => `    <<${v.anno}>> ${v.target}` },
    ];

    case 'gantt': return [
      { id: 'gt-section', label: 'Section', icon: '📂', fields: [
        { name: 'name', label: 'Tên section', placeholder: 'VD: Phase 1' },
      ], generate: v => `    section ${v.name}` },
      { id: 'gt-task', label: 'Task', icon: '✅', fields: [
        { name: 'name', label: 'Tên task', placeholder: 'VD: Design' },
        { name: 'status', label: 'Status', type: 'select', placeholder: '', options: [
          { value: 'active,', label: 'Active' }, { value: 'done,', label: 'Done' }, { value: 'crit,', label: 'Critical' }, { value: '', label: 'Normal' },
        ]},
        { name: 'duration', label: 'Duration', placeholder: 'VD: 2024-01-01, 30d' },
      ], generate: v => `    ${v.name} : ${v.status} ${v.duration}` },
      { id: 'gt-milestone', label: 'Milestone', icon: '🏁', fields: [
        { name: 'name', label: 'Tên', placeholder: 'VD: Release' },
        { name: 'date', label: 'Ngày', placeholder: 'VD: 2024-02-01, 0d' },
      ], generate: v => `    ${v.name} : milestone, ${v.date}` },
    ];

    case 'pie': return [
      { id: 'pie-slice', label: 'Slice', icon: '🥧', fields: [
        { name: 'label', label: 'Nhãn', placeholder: 'VD: Chrome' },
        { name: 'value', label: 'Giá trị', placeholder: 'VD: 45.5' },
      ], generate: v => `    "${v.label}" : ${v.value}` },
    ];

    case 'mindmap': return [
      { id: 'mm-root', label: 'Root', icon: '🌳', fields: [
        { name: 'text', label: 'Tên gốc', placeholder: 'VD: Main Topic' },
      ], generate: v => `  root((${v.text}))` },
      { id: 'mm-branch', label: 'Nhánh', icon: '🌿', fields: [
        { name: 'text', label: 'Tên nhánh', placeholder: 'VD: Sub Topic' },
        { name: 'depth', label: 'Cấp (2-6)', type: 'select', placeholder: '', options: [
          { value: '2', label: 'Cấp 2 (4 space)' }, { value: '3', label: 'Cấp 3 (6 space)' },
          { value: '4', label: 'Cấp 4 (8 space)' },
        ]},
      ], generate: v => `${'  '.repeat(Number(v.depth) || 2)}${v.text}` },
    ];

    case 'git': return [
      { id: 'git-commit', label: 'Commit', icon: '⚫', fields: [
        { name: 'msg', label: 'Message', placeholder: 'VD: Initial commit' },
        { name: 'id', label: 'ID (tùy chọn)', placeholder: 'VD: abc123' },
      ], generate: v => v.id ? `    commit id: "${v.id}" msg: "${v.msg}"` : `    commit msg: "${v.msg}"` },
      { id: 'git-branch', label: 'Branch', icon: '🌿', fields: [
        { name: 'name', label: 'Tên branch', placeholder: 'VD: develop' },
      ], generate: v => `    branch ${v.name}` },
      { id: 'git-checkout', label: 'Checkout', icon: '🔀', fields: [
        { name: 'name', label: 'Branch', placeholder: 'VD: main' },
      ], generate: v => `    checkout ${v.name}` },
      { id: 'git-merge', label: 'Merge', icon: '🔗', fields: [
        { name: 'name', label: 'Branch', placeholder: 'VD: develop' },
      ], generate: v => `    merge ${v.name}` },
    ];

    default: return [];
  }
}

export function insertSnippet(code: string, snippet: string): string {
  const lines = code.split('\n');
  const idx = findInsertPoint(lines, getChartType(code));
  lines.splice(idx, 0, snippet);
  return lines.join('\n');
}

function findInsertPoint(lines: string[], chartType: string): number {
  if (chartType === 'flowchart') {
    for (let i = lines.length - 1; i >= 0; i--) {
      const t = lines[i].trim();
      if (t && !t.startsWith('style ') && !t.startsWith('classDef ') && !t.startsWith('linkStyle')) return i + 1;
    }
  }
  return lines.length;
}

function genId(prefix: string): string {
  return `${prefix}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

const SHAPE_PATTERNS: { type: ShapeType; regex: RegExp }[] = [
  { type: 'circle', regex: /\(\("([^"]*?)"\)\)|\(\(([^)]*?)\)\)/ },
  { type: 'cylinder', regex: /\[\("([^"]*?)"\)\]|\[\(([^)]*?)\)\]/ },
  { type: 'hexagon', regex: /\{\{"([^"]*?)"\}\}|\{\{([^}]*?)\}\}/ },
  { type: 'stadium', regex: /\(\["([^"]*?)"\]\)|\(\[([^\]]*?)\]\)/ },
  { type: 'subroutine', regex: /\[\["([^"]*?)"\]\]|\[\[([^\]]*?)\]\]/ },
  { type: 'diamond', regex: /\{"([^"]*?)"\}|\{([^}]*?)\}/ },
  { type: 'rounded', regex: /\("([^"]*?)"\)|\(([^)]*?)\)/ },
  { type: 'rect', regex: /\["([^"]*?)"\]|\[([^\]]*?)\]/ },
];

export function parseNodes(code: string): DiagramNode[] {
  const nodes = new Map<string, DiagramNode>();
  for (const line of code.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('style ') || trimmed.startsWith('classDef ') || trimmed.startsWith('subgraph') || trimmed === 'end' || trimmed.startsWith('direction') || trimmed.startsWith('%%') || trimmed.startsWith('linkStyle')) continue;
    const segments = trimmed.split(/-->|---|-\.->|==>|<-->/).map(s => s.replace(/\|[^|]*\|/g, '').trim()).filter(Boolean);
    for (const seg of segments) {
      const idMatch = seg.match(/^([A-Za-z_]\w*)/);
      if (!idMatch) continue;
      const id = idMatch[1];
      if (['graph', 'flowchart', 'subgraph', 'end', 'direction', 'style', 'classDef', 'click', 'linkStyle', 'TB', 'TD', 'BT', 'RL', 'LR'].includes(id)) continue;
      if (nodes.has(id)) continue;
      const afterId = seg.slice(id.length);
      let shape: ShapeType = 'rect';
      let label = id;
      for (const sp of SHAPE_PATTERNS) { const m = afterId.match(sp.regex); if (m) { shape = sp.type; label = m[1] || m[2] || id; break; } }
      nodes.set(id, { id, label, shape });
    }
  }
  return Array.from(nodes.values());
}

export function generateNodeId(existing: DiagramNode[]): string {
  const ids = new Set(existing.map(n => n.id));
  for (let i = 1; i <= 999; i++) { if (!ids.has(`N${i}`)) return `N${i}`; }
  return `N${Date.now()}`;
}

export function insertNode(code: string, nodeId: string, label: string, shape: ShapeType): string {
  const shapeDef = SHAPES.find(s => s.type === shape) || SHAPES[0];
  const lines = code.split('\n');
  lines.splice(findInsertPoint(lines, 'flowchart'), 0, `    ${shapeDef.wrap(nodeId, label)}`);
  return lines.join('\n');
}

export function insertConnection(code: string, from: string, to: string, arrow: ArrowType, label?: string): string {
  const arrowDef = ARROWS.find(a => a.type === arrow) || ARROWS[0];
  const connLine = label ? `    ${from} ${arrowDef.syntax}|"${label}"| ${to}` : `    ${from} ${arrowDef.syntax} ${to}`;
  const lines = code.split('\n');
  lines.splice(findInsertPoint(lines, 'flowchart'), 0, connLine);
  return lines.join('\n');
}

export function insertSubgraph(code: string, label: string, nodeIds: string[]): string {
  const subId = label.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
  const lines = code.split('\n');
  lines.splice(findInsertPoint(lines, 'flowchart'), 0, ...[`    subgraph ${subId}["${label}"]`, `        direction TB`, ...nodeIds.map(id => `        ${id}`), `    end`]);
  return lines.join('\n');
}

export function changeNodeShape(code: string, nodeId: string, newShape: ShapeType): string {
  const nodes = parseNodes(code);
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return code;
  const shapeDef = SHAPES.find(s => s.type === newShape) || SHAPES[0];
  return replaceNodeDefinition(code, nodeId, shapeDef.wrap(nodeId, node.label));
}

export function getNodeConnections(code: string, nodeId: string): { to: string; arrow: string; label: string }[] {
  const conns: { to: string; arrow: string; label: string }[] = [];
  for (const line of code.split('\n')) {
    const m = line.match(new RegExp(`${nodeId}\\s*(-->|---|-\\.->|==>)\\|?"?([^"|]*)"?\\|?\\s*(\\w+)`));
    if (m) conns.push({ to: m[3], arrow: m[1], label: m[2]?.trim() || '' });
  }
  return conns;
}

function replaceNodeDefinition(code: string, nodeId: string, replacement: string): string {
  const escaped = nodeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|\\s)${escaped}(\\[|\\(|\\{|>)`, 'm');
  return code.split('\n').map(line => {
    if (!regex.test(line)) return line;
    const parts = line.split(/-->|---|-\.->|==>|<-->/);
    if (parts.length <= 1) return (line.match(/^(\s*)/)?.[1] || '') + replacement;
    return line.replace(new RegExp(`${escaped}(\\[\\[|\\[\\(|\\(\\[|\\(\\(|\\{\\{|\\[|\\(|\\{|>)[^\\]\\)\\}]*(\\]\\]|\\)\\]|\\]\\)|\\)\\)|\\}\\}|\\]|\\)|\\})`), replacement);
  }).join('\n');
}
