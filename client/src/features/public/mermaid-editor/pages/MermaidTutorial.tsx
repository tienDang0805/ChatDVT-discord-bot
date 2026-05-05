import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import mermaid from 'mermaid';
import { PageShell } from '../../../../shared/components/PageShell';

interface Section {
  id: string;
  title: string;
  icon: string;
  content: TutorialBlock[];
}

interface TutorialBlock {
  type: 'text' | 'code' | 'diagram' | 'tip';
  content: string;
}

const SECTIONS: Section[] = [
  {
    id: 'intro',
    title: 'Mermaid là gì?',
    icon: '🧜‍♀️',
    content: [
      { type: 'text', content: 'Mermaid là một ngôn ngữ dựa trên text cho phép bạn tạo ra các diagram và flowchart bằng cách viết code đơn giản. Thay vì kéo thả trong Visio hay draw.io, bạn chỉ cần viết vài dòng text → tự động render thành biểu đồ đẹp.' },
      { type: 'tip', content: 'Mermaid được hỗ trợ native trên GitHub, GitLab, Notion, Obsidian, và hầu hết các Markdown renderer hiện đại.' },
      { type: 'text', content: 'Cú pháp cơ bản: Bọc code mermaid trong markdown block:\n\n````\n```mermaid\ngraph TD\n    A --> B\n```\n````' },
    ],
  },
  {
    id: 'flowchart',
    title: 'Flowchart (Sơ đồ luồng)',
    icon: '📊',
    content: [
      { type: 'text', content: 'Flowchart là loại diagram phổ biến nhất. Hỗ trợ các hướng: TB (top→bottom), TD (top→down), BT, RL, LR.' },
      { type: 'code', content: 'graph TD\n    A[Hình chữ nhật] --> B(Hình bo tròn)\n    B --> C{Hình thoi - Điều kiện}\n    C -->|Có| D[Kết quả 1]\n    C -->|Không| E[Kết quả 2]' },
      { type: 'diagram', content: 'graph TD\n    A[Hình chữ nhật] --> B(Hình bo tròn)\n    B --> C{Hình thoi - Điều kiện}\n    C -->|Có| D[Kết quả 1]\n    C -->|Không| E[Kết quả 2]' },
      { type: 'text', content: '**Các loại node shape:**' },
      { type: 'code', content: 'A[Text]           %% Hình chữ nhật\nB(Text)           %% Bo góc\nC((Text))         %% Hình tròn\nD{Text}           %% Hình thoi\nE>Text]           %% Cờ\nF[[Text]]         %% Subroutine\nG[(Text)]         %% Cylinder (Database)\nH{{Text}}         %% Hexagon' },
      { type: 'text', content: '**Các loại arrow:**' },
      { type: 'code', content: 'A --> B            %% Arrow thường\nA --- B            %% Đường thẳng (không mũi tên)\nA -.-> B           %% Đường đứt nét\nA ==> B            %% Đường đậm\nA -->|Label| B     %% Arrow có label\nA -- Label --- B   %% Đường có label' },
      { type: 'text', content: '**Subgraph — Nhóm các node:**' },
      { type: 'code', content: 'graph TD\n    subgraph Backend\n        API[API Server]\n        DB[(Database)]\n        API --> DB\n    end\n    subgraph Frontend\n        UI[React App]\n    end\n    UI --> API' },
      { type: 'diagram', content: 'graph TD\n    subgraph Backend\n        API[API Server]\n        DB[(Database)]\n        API --> DB\n    end\n    subgraph Frontend\n        UI[React App]\n    end\n    UI --> API' },
      { type: 'text', content: '**Style node:**' },
      { type: 'code', content: 'graph TD\n    A[Styled Node]\n    style A fill:#f97316,stroke:#ea580c,color:#fff,stroke-width:2px' },
    ],
  },
  {
    id: 'sequence',
    title: 'Sequence Diagram',
    icon: '🔄',
    content: [
      { type: 'text', content: 'Sequence diagram mô tả tương tác giữa các đối tượng theo thứ tự thời gian. Rất hữu ích cho mô tả API flow, authentication flow.' },
      { type: 'code', content: 'sequenceDiagram\n    participant U as User\n    participant S as Server\n    participant D as Database\n\n    U->>S: GET /api/users\n    S->>D: SELECT * FROM users\n    D-->>S: Result set\n    S-->>U: JSON response\n\n    Note over S,D: Xử lý trong 50ms\n    Note right of U: Hiển thị data' },
      { type: 'diagram', content: 'sequenceDiagram\n    participant U as User\n    participant S as Server\n    participant D as Database\n\n    U->>S: GET /api/users\n    S->>D: SELECT * FROM users\n    D-->>S: Result set\n    S-->>U: JSON response\n\n    Note over S,D: Xử lý trong 50ms' },
      { type: 'text', content: '**Các loại arrow:**\n- `->>`  Đường liền + mũi tên\n- `-->>`  Đường đứt + mũi tên\n- `->` Đường liền, không mũi tên\n- `-->`  Đường đứt, không mũi tên' },
      { type: 'text', content: '**Loops và Alt:**' },
      { type: 'code', content: 'sequenceDiagram\n    User->>API: Request\n    alt Success\n        API-->>User: 200 OK\n    else Error\n        API-->>User: 500 Error\n    end\n    loop Retry 3 times\n        User->>API: Retry\n    end' },
    ],
  },
  {
    id: 'class',
    title: 'Class Diagram',
    icon: '🏗️',
    content: [
      { type: 'text', content: 'Class diagram mô tả cấu trúc OOP: class, properties, methods, và quan hệ kế thừa.' },
      { type: 'code', content: 'classDiagram\n    class Animal {\n        +String name\n        +int age\n        +makeSound() void\n    }\n    class Dog {\n        +String breed\n        +fetch() void\n    }\n    Animal <|-- Dog\n    Animal <|-- Cat' },
      { type: 'diagram', content: 'classDiagram\n    class Animal {\n        +String name\n        +int age\n        +makeSound() void\n    }\n    class Dog {\n        +String breed\n        +fetch() void\n    }\n    Animal <|-- Dog' },
      { type: 'text', content: '**Quan hệ:**\n- `<|--` Kế thừa\n- `*--` Composition\n- `o--` Aggregation\n- `-->` Association\n- `..>` Dependency\n- `..|>` Implementation' },
    ],
  },
  {
    id: 'state',
    title: 'State Diagram',
    icon: '🔀',
    content: [
      { type: 'text', content: 'State diagram mô tả các trạng thái của một đối tượng và các chuyển đổi giữa chúng.' },
      { type: 'code', content: 'stateDiagram-v2\n    [*] --> Idle\n    Idle --> Loading : fetch()\n    Loading --> Success : 200 OK\n    Loading --> Error : 4xx/5xx\n    Success --> Idle : reset()\n    Error --> Loading : retry()\n    Error --> Idle : dismiss()' },
      { type: 'diagram', content: 'stateDiagram-v2\n    [*] --> Idle\n    Idle --> Loading : fetch()\n    Loading --> Success : 200 OK\n    Loading --> Error : 4xx/5xx\n    Success --> Idle : reset()\n    Error --> Loading : retry()' },
    ],
  },
  {
    id: 'er',
    title: 'ER Diagram',
    icon: '🗃️',
    content: [
      { type: 'text', content: 'Entity-Relationship diagram mô tả cấu trúc database: bảng, cột, và quan hệ.' },
      { type: 'code', content: 'erDiagram\n    USER ||--o{ ORDER : places\n    ORDER ||--|{ LINE_ITEM : contains\n    PRODUCT ||--o{ LINE_ITEM : "ordered in"\n\n    USER {\n        int id PK\n        string name\n        string email\n    }\n    ORDER {\n        int id PK\n        date created_at\n        string status\n    }' },
      { type: 'diagram', content: 'erDiagram\n    USER ||--o{ ORDER : places\n    ORDER ||--|{ LINE_ITEM : contains\n\n    USER {\n        int id PK\n        string name\n        string email\n    }\n    ORDER {\n        int id PK\n        date created_at\n    }' },
      { type: 'text', content: '**Quan hệ:**\n- `||--||` One to One\n- `||--o{` One to Many\n- `}o--o{` Many to Many\n- `||--|{` One to One or More' },
    ],
  },
  {
    id: 'gantt',
    title: 'Gantt Chart',
    icon: '📅',
    content: [
      { type: 'text', content: 'Gantt chart hiển thị timeline dự án với các task, thời gian, và phụ thuộc.' },
      { type: 'code', content: 'gantt\n    title Project Timeline\n    dateFormat YYYY-MM-DD\n    section Planning\n        Requirements   :a1, 2024-01-01, 14d\n        Design         :a2, after a1, 10d\n    section Development\n        Frontend       :b1, after a2, 21d\n        Backend        :b2, after a2, 28d\n    section Testing\n        QA             :c1, after b2, 14d' },
      { type: 'diagram', content: 'gantt\n    title Project Timeline\n    dateFormat YYYY-MM-DD\n    section Planning\n        Requirements   :a1, 2024-01-01, 14d\n        Design         :a2, after a1, 10d\n    section Dev\n        Frontend       :b1, after a2, 21d\n        Backend        :b2, after a2, 28d' },
    ],
  },
  {
    id: 'pie',
    title: 'Pie Chart',
    icon: '🥧',
    content: [
      { type: 'text', content: 'Pie chart đơn giản nhất — chỉ cần title và data.' },
      { type: 'code', content: 'pie title Tech Stack\n    "React" : 35\n    "Node.js" : 25\n    "TypeScript" : 20\n    "PostgreSQL" : 12\n    "Docker" : 8' },
      { type: 'diagram', content: 'pie title Tech Stack\n    "React" : 35\n    "Node.js" : 25\n    "TypeScript" : 20\n    "PostgreSQL" : 12\n    "Docker" : 8' },
    ],
  },
  {
    id: 'mindmap',
    title: 'Mind Map',
    icon: '🧠',
    content: [
      { type: 'text', content: 'Mind map tổ chức ý tưởng theo cấu trúc cây. Indent bằng space để tạo nhánh con.' },
      { type: 'code', content: 'mindmap\n  root((Project))\n    Frontend\n      React\n      TypeScript\n    Backend\n      Node.js\n      PostgreSQL\n    DevOps\n      Docker\n      CI/CD' },
      { type: 'diagram', content: 'mindmap\n  root((Project))\n    Frontend\n      React\n      TypeScript\n    Backend\n      Node.js\n      PostgreSQL\n    DevOps\n      Docker' },
    ],
  },
  {
    id: 'git',
    title: 'Git Graph',
    icon: '🌿',
    content: [
      { type: 'text', content: 'Git graph visualize branching và merging workflow.' },
      { type: 'code', content: 'gitgraph\n    commit id: "init"\n    branch develop\n    commit id: "feat-1"\n    commit id: "feat-2"\n    checkout main\n    merge develop id: "v1.0"\n    branch hotfix\n    commit id: "fix-1"\n    checkout main\n    merge hotfix id: "v1.0.1"' },
      { type: 'diagram', content: 'gitgraph\n    commit id: "init"\n    branch develop\n    commit id: "feat-1"\n    checkout main\n    merge develop id: "v1.0"\n    branch hotfix\n    commit id: "fix"\n    checkout main\n    merge hotfix id: "v1.0.1"' },
    ],
  },
  {
    id: 'styling',
    title: 'Styling & Theme',
    icon: '🎨',
    content: [
      { type: 'text', content: '**Style từng node:**' },
      { type: 'code', content: 'style nodeId fill:#color,stroke:#color,color:#textColor,stroke-width:2px' },
      { type: 'text', content: '**ClassDef — Tạo style class tái sử dụng:**' },
      { type: 'code', content: 'graph TD\n    A[Node A]:::primary\n    B[Node B]:::danger\n    classDef primary fill:#f97316,color:#fff,stroke:#ea580c\n    classDef danger fill:#ef4444,color:#fff,stroke:#dc2626' },
      { type: 'diagram', content: 'graph TD\n    A[Node A]:::primary\n    B[Node B]:::danger\n    classDef primary fill:#f97316,color:#fff,stroke:#ea580c\n    classDef danger fill:#ef4444,color:#fff,stroke:#dc2626' },
      { type: 'text', content: '**Theme:** Mermaid hỗ trợ các theme: `default`, `dark`, `forest`, `neutral`. Config qua `mermaid.initialize({ theme: "dark" })`.' },
      { type: 'tip', content: 'Trong Mermaid Editor của ChatDVT, bạn có thể click trực tiếp vào node để mở Style Editor — chỉnh fill, stroke, text color bằng UI!' },
    ],
  },
];

const LiveDiagram = ({ code }: { code: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(0);

  useEffect(() => {
    if (!ref.current) return;
    renderIdRef.current++;
    const id = `tutorial-${renderIdRef.current}-${Date.now()}`;
    mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose', fontFamily: 'system-ui, sans-serif' });
    mermaid.render(id, code).then(({ svg }) => {
      if (ref.current) {
        ref.current.innerHTML = svg;
        const svgEl = ref.current.querySelector('svg');
        if (svgEl) { svgEl.style.maxWidth = '100%'; svgEl.style.height = 'auto'; svgEl.removeAttribute('height'); }
      }
    }).catch(() => {
      if (ref.current) ref.current.innerHTML = '<p style="color:#ef4444">Render error</p>';
    });
  }, [code]);

  return (
    <div className="my-4 p-5 bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl overflow-auto shadow-sm">
      <div ref={ref} className="flex justify-center [&_svg]:max-w-full [&_svg]:h-auto" />
    </div>
  );
};

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [code]);

  return (
    <div className="relative my-3 group">
      <pre className="bg-slate-100 dark:bg-[#1f2937] text-slate-800 dark:text-slate-200 p-4 rounded-xl text-[13px] font-mono leading-relaxed overflow-x-auto border border-slate-200 dark:border-slate-700">
        <code>{code}</code>
      </pre>
      <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 rounded-lg bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm" title="Copy code">
        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
      </button>
    </div>
  );
};

export const MermaidTutorial = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['intro', 'flowchart']));

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedSections(new Set(SECTIONS.map(s => s.id)));
  const collapseAll = () => setExpandedSections(new Set());

  return (
    <PageShell title="Mermaid Tutorial" subtitle="Hướng dẫn tổng quan Mermaid A→Z" icon="📐" backTo="/mermaid-editor">
      <div className="text-center mb-10">
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
          Tất cả syntax, diagram types, và styling bạn cần biết để vẽ biểu đồ chuyên nghiệp bằng text.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={expandAll} className="text-xs font-bold text-orange-500 hover:text-orange-600 px-4 py-2 border border-orange-500/30 rounded-xl hover:bg-orange-500/10 transition-all">
            Mở tất cả
          </button>
          <button onClick={collapseAll} className="text-xs font-bold text-slate-500 hover:text-slate-600 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-[#1a2332] transition-all">
            Thu gọn
          </button>
          <Link to="/mermaid-editor" className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-xl transition-all shadow-sm active:scale-[0.98]">
            🚀 Mở Editor
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-8 shadow-sm">
        <label className="block text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">📑 Mục lục</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => { setExpandedSections(prev => new Set(prev).add(s.id)); document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="text-left text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-orange-500 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1a2332] transition-all truncate">
              {s.icon} {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <a href="https://mermaid.js.org/intro/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-orange-500 transition-colors">
          Tài liệu gốc Mermaid.js <ExternalLink size={12} />
        </a>
      </div>

      <div className="space-y-4">
        {SECTIONS.map(section => {
          const isExpanded = expandedSections.has(section.id);
          return (
            <div key={section.id} id={`section-${section.id}`} className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
              <button onClick={() => toggleSection(section.id)} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-[#1a2332] transition-colors">
                <span className="text-2xl">{section.icon}</span>
                <span className="flex-1 text-lg font-bold text-slate-800 dark:text-slate-100">{section.title}</span>
                {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
              </button>
              {isExpanded && (
                <div className="px-5 pb-5 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                  {section.content.map((block, i) => {
                    switch (block.type) {
                      case 'text':
                        return <div key={i} className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: block.content.replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-800 dark:text-slate-200">$1</strong>').replace(/`([^`]+)`/g, '<code class="bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>').replace(/\n/g, '<br>') }} />;
                      case 'code':
                        return <CodeBlock key={i} code={block.content} />;
                      case 'diagram':
                        return <LiveDiagram key={i} code={block.content} />;
                      case 'tip':
                        return (
                          <div key={i} className="flex gap-2 p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl text-sm text-slate-600 dark:text-slate-300">
                            <span className="shrink-0">💡</span>
                            <span>{block.content}</span>
                          </div>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center p-8 bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Sẵn sàng vẽ diagram? 🚀</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-5 text-sm">Mở Mermaid Editor để bắt đầu tạo diagram ngay!</p>
        <Link to="/mermaid-editor" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98]">
          🎨 Mở Mermaid Editor
        </Link>
      </div>
    </PageShell>
  );
};
