import mermaid from 'mermaid';

export interface TreeNode {
  id: string;
  label: string;
  type: 'diagram' | 'node' | 'connection' | 'section' | 'keyword';
  children: TreeNode[];
  line?: number;
}

export const DEFAULT_CODE = `graph TD
    A[🚀 Start] --> B{Decision?}
    B -->|Yes| C[✅ Process A]
    B -->|No| D[❌ Process B]
    C --> E[📦 Result]
    D --> E
    E --> F((🏁 End))

    style A fill:#667eea,stroke:#5a67d8,color:#fff
    style B fill:#f6ad55,stroke:#ed8936,color:#fff
    style C fill:#68d391,stroke:#48bb78,color:#fff
    style D fill:#fc8181,stroke:#f56565,color:#fff
    style E fill:#76e4f7,stroke:#0bc5ea,color:#fff
    style F fill:#b794f4,stroke:#9f7aea,color:#fff`;

export const SAMPLE_DIAGRAMS: Record<string, string> = {
  flowchart: `graph TD
    A[🚀 Start] --> B{Decision?}
    B -->|Yes| C[✅ Process A]
    B -->|No| D[❌ Process B]
    C --> E[📦 Result]
    D --> E
    E --> F((🏁 End))

    style A fill:#667eea,stroke:#5a67d8,color:#fff
    style B fill:#f6ad55,stroke:#ed8936,color:#fff
    style C fill:#68d391,stroke:#48bb78,color:#fff
    style D fill:#fc8181,stroke:#f56565,color:#fff
    style E fill:#76e4f7,stroke:#0bc5ea,color:#fff
    style F fill:#b794f4,stroke:#9f7aea,color:#fff`,

  sequence: `sequenceDiagram
    participant U as 👤 User
    participant F as 🖥️ Frontend
    participant A as ⚙️ API
    participant D as 🗄️ Database

    U->>F: Click Login
    F->>A: POST /auth/login
    A->>D: Query user
    D-->>A: User data
    A-->>F: JWT Token
    F-->>U: Redirect Dashboard`,

  classDiagram: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound() void
    }
    class Dog {
        +String breed
        +fetch() void
    }
    class Cat {
        +bool isIndoor
        +purr() void
    }
    Animal <|-- Dog
    Animal <|-- Cat`,

  stateDiagram: `stateDiagram-v2
    [*] --> Idle
    Idle --> Loading : fetch()
    Loading --> Success : 200 OK
    Loading --> Error : 4xx/5xx
    Success --> Idle : reset()
    Error --> Loading : retry()
    Error --> Idle : dismiss()`,

  erDiagram: `erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    PRODUCT ||--o{ LINE_ITEM : "ordered in"
    USER {
        int id PK
        string name
        string email
    }
    ORDER {
        int id PK
        date created_at
        string status
    }`,

  gantt: `gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Requirements   :a1, 2024-01-01, 14d
    Design         :a2, after a1, 10d
    section Development
    Frontend       :b1, after a2, 21d
    Backend        :b2, after a2, 28d
    section Testing
    QA Testing     :c1, after b2, 14d
    UAT            :c2, after c1, 7d`,

  pie: `pie title Tech Stack Distribution
    "React" : 35
    "Node.js" : 25
    "TypeScript" : 20
    "PostgreSQL" : 12
    "Docker" : 8`,

  gitGraph: `gitgraph
    commit id: "init"
    branch develop
    commit id: "feat-1"
    commit id: "feat-2"
    checkout main
    merge develop id: "v1.0"
    branch hotfix
    commit id: "fix-1"
    checkout main
    merge hotfix id: "v1.0.1"`,

  mindmap: `mindmap
  root((Project))
    Frontend
      React
      TypeScript
      TailwindCSS
    Backend
      Node.js
      Express
      PostgreSQL
    DevOps
      Docker
      CI/CD
      AWS`,
};

export function buildTreeFromCode(code: string): TreeNode[] {
  const lines = code.split('\n').filter(l => l.trim());
  if (lines.length === 0) return [];

  const root: TreeNode = {
    id: 'root',
    label: 'Diagram',
    type: 'diagram',
    children: [],
  };

  const firstLine = lines[0].trim().toLowerCase();
  if (firstLine.startsWith('graph') || firstLine.startsWith('flowchart')) {
    root.label = '📊 Flowchart';
  } else if (firstLine.startsWith('sequencediagram')) {
    root.label = '🔄 Sequence Diagram';
  } else if (firstLine.startsWith('classdiagram')) {
    root.label = '🏗️ Class Diagram';
  } else if (firstLine.startsWith('statediagram')) {
    root.label = '🔀 State Diagram';
  } else if (firstLine.startsWith('erdiagram')) {
    root.label = '🗃️ ER Diagram';
  } else if (firstLine.startsWith('gantt')) {
    root.label = '📅 Gantt Chart';
  } else if (firstLine.startsWith('pie')) {
    root.label = '🥧 Pie Chart';
  } else if (firstLine.startsWith('gitgraph')) {
    root.label = '🌿 Git Graph';
  } else if (firstLine.startsWith('mindmap')) {
    root.label = '🧠 Mind Map';
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    let nodeType: TreeNode['type'] = 'node';
    if (line.startsWith('style') || line.startsWith('classDef')) {
      nodeType = 'keyword';
    } else if (line.includes('-->') || line.includes('->') || line.includes('->>') || line.includes('-->>')) {
      nodeType = 'connection';
    } else if (line.startsWith('section') || line.startsWith('participant') || line.startsWith('class ')) {
      nodeType = 'section';
    }

    root.children.push({
      id: `line-${i}`,
      label: line.length > 60 ? line.substring(0, 57) + '...' : line,
      type: nodeType,
      children: [],
      line: i,
    });
  }

  return [root];
}

export async function initMermaid(theme: string): Promise<void> {
  mermaid.initialize({
    startOnLoad: false,
    theme: theme === 'dark' ? 'dark' : 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, system-ui, sans-serif',
    flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
    sequence: { useMaxWidth: true },
    gantt: { useMaxWidth: true },
  });
}

export async function renderMermaid(
  code: string,
  containerId: string
): Promise<{ svg: string; error: string | null }> {
  try {
    const { svg } = await mermaid.render(containerId, code);
    return { svg, error: null };
  } catch (err: any) {
    return { svg: '', error: err?.message || 'Syntax error in diagram' };
  }
}

export function extractMermaidFromMarkdown(mdContent: string): string[] {
  const regex = /```mermaid\s*\n([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match;
  while ((match = regex.exec(mdContent)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

export function wrapInMarkdown(code: string): string {
  return '```mermaid\n' + code + '\n```\n';
}

export async function exportToPng(svgElement: SVGElement): Promise<Blob> {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const img = new Image();

  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = img.naturalWidth * 2;
      canvas.height = img.naturalHeight * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create PNG'));
      }, 'image/png');
    };
    img.onerror = reject;
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  });
}

export function exportToSvgBlob(svgElement: SVGElement): Blob {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  return new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
}
