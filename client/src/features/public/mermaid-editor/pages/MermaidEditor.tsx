import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CornerUpLeft, Upload, Download, FileText, Image, FileCode, BookOpen, Code2, PanelLeftClose, PanelLeft, FileDown, FileType, HelpCircle, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../../../shared/contexts/ThemeContext';
import { usePageMeta } from '../../../../shared/hooks/usePageMeta';
import { EditorPanel } from '../components/EditorPanel';
import { DocumentView } from '../components/DocumentView';
import { TreeViewPanel } from '../components/TreeViewPanel';
import { SampleSelector } from '../components/SampleSelector';
import { DiagramModal } from '../components/DiagramModal';
import { DEFAULT_CODE, buildTreeFromCode, initMermaid, wrapInMarkdown, exportToPng } from '../utils/mermaidHelpers';
import { parseMarkdownBlocks, blocksToMarkdown } from '../utils/styleUtils';
import { exportDocumentPdf, exportDocumentWord, exportDocumentHtml } from '../utils/exportUtils';

type ViewMode = 'editor' | 'document';

const SAMPLE_MD = `# OmniCXM Analytics SDK — Tổng quan hệ thống

---

## 1. Big Picture — Toàn bộ hệ thống trong 1 hình

\`\`\`mermaid
flowchart LR
    subgraph MOBILE["Mobile App (OmniCXM)"]
        direction TB
        U["User dùng app"] --> TRACK["SDK tự động thu thập"]
        TRACK --> BUF["Buffer (MMKV)"]
    end

    BUF -->|"Gửi batch mỗi 60s\\nhoặc đủ 30 events"| API["POST /analytics/v1/ingest"]

    subgraph SERVER["CodePush Server"]
        direction TB
        API --> DB[("MySQL\\n4 tables")]
        DB --> DASH["Dashboard Web"]
    end

    DASH -->|"Admin xem"| REPORT["Báo cáo:\\n- Sessions\\n- Screens\\n- Customers\\n- Errors"]
\`\`\`

> **Tóm tắt:** User dùng app → SDK tự thu thập → gom vào buffer → gửi batch lên server → lưu DB → hiện dashboard.

---

## 2. SDK thu thập những gì?

\`\`\`mermaid
mindmap
  root((Analytics SDK))
    Sessions
      Khi nào mở app
      Dùng bao lâu
      Thiết bị gì
      OS gì
    Screens
      Đang xem màn hình nào
      Từ màn hình nào chuyển tới
      Ở mỗi màn bao lâu
    B2B Context
      Mã khách hàng
      User ID
      Username
      Modules đang dùng
    Errors
      JS crash
      Unhandled rejection
      Lỗi ở screen nào
\`\`\`

---

## 3. Lifecycle — Thứ tự events khi user dùng app

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant APP as Mobile App
    participant SDK as Analytics SDK
    participant BUF as Buffer (MMKV)
    participant CPS as CodePush Server
    participant DB as MySQL

    Note over APP: App khởi động
    APP->>SDK: analytics.init()
    SDK->>SDK: Tạo session mới
    SDK->>BUF: event "session_start"

    Note over U: User đăng nhập
    APP->>SDK: setUserContext("C0384", userId, username)
    APP->>SDK: setActiveModules(["tickets", "omnichat"])

    Note over U: User chuyển màn hình
    U->>APP: Mở TicketList
    APP->>SDK: trackScreen("TicketList")
    SDK->>BUF: event "screen_view" + screen_name
    U->>APP: Mở TicketDetail
    APP->>SDK: trackScreen("TicketDetail")
    SDK->>BUF: event "screen_view" + previous_screen

    Note over BUF: Đủ 30 events hoặc 60s
    BUF->>CPS: POST /analytics/v1/ingest
    CPS->>DB: INSERT sessions + events

    Note over U: User tắt app
    APP->>SDK: AppState background
    SDK->>BUF: event "session_end" + duration
    BUF->>CPS: Flush ngay lập tức
    CPS->>DB: UPDATE session ended_at
\`\`\`

---

## 4. Các component và vai trò

\`\`\`mermaid
flowchart TB
    subgraph SDK["Analytics SDK (Mobile)"]
        AS["AnalyticsService\\n(Singleton)"]
        SM["SessionManager"]
        EB["EventBuffer"]
        ST["useAnalyticsStore\\n(Zustand)"]
        MM["MMKV Storage"]

        AS -->|"quản lý"| SM
        AS -->|"quản lý"| EB
        AS <-->|"đọc/ghi state"| ST
        SM -->|"push events"| EB
        EB <-->|"persist events"| MM
    end

    style AS fill:#6366f1,color:#fff
    style SM fill:#10b981,color:#fff
    style EB fill:#f59e0b,color:#fff
    style ST fill:#8b5cf6,color:#fff
    style MM fill:#64748b,color:#fff
\`\`\`

| Component | Vai trò |
|-----------|---------|
| **AnalyticsService** | "Cửa chính" — duy nhất 1 instance, cung cấp trackScreen, trackEvent, setUserContext |
| **SessionManager** | Quản lý vòng đời session, listen AppState, tạo/kết thúc session |
| **EventBuffer** | Gom events vào hàng đợi MMKV, tự flush khi đủ 30 events hoặc 60 giây |
| **useAnalyticsStore** | Zustand store giữ state runtime: sessionId, currentScreen, eventCount |
| **MMKV Storage** | Persistence layer — events không bị mất khi app crash hoặc mất mạng |

---

## 5. Buffer hoạt động như thế nào?

\`\`\`mermaid
flowchart LR
    E1["Event 1"] --> BUF["Buffer\\n(MMKV)"]
    E2["Event 2"] --> BUF
    E3["Event ..."] --> BUF
    E30["Event 30"] --> BUF

    BUF -->|"Trigger flush"| CHECK{"Điều kiện?"}

    CHECK -->|"Buffer >= 30"| SEND
    CHECK -->|"Timer 60s"| SEND
    CHECK -->|"App background"| SEND

    SEND["POST /analytics/v1/ingest"] -->|"OK 200"| CLEAR["Xóa buffer\\nReset counter"]
    SEND -->|"FAIL"| RETRY["Retry max 3 lần\\nGiữ buffer"]

    style BUF fill:#f59e0b,color:#fff
    style SEND fill:#6366f1,color:#fff
    style CLEAR fill:#10b981,color:#fff
    style RETRY fill:#ef4444,color:#fff
\`\`\`
`;

export const MermaidEditor = () => {
  const { theme, toggleTheme } = useTheme();
  usePageMeta('Mermaid Editor');
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [rawCode, setRawCode] = useState(() => localStorage.getItem('mermaid_editor_code') || DEFAULT_CODE);
  const [docContent, setDocContent] = useState(() => localStorage.getItem('mermaid_doc_content') || SAMPLE_MD);
  const [showTree, setShowTree] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [expandedDiagram, setExpandedDiagram] = useState<{ index: number; code: string } | null>(null);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const docBlocks = parseMarkdownBlocks(docContent);
  const editorTree = buildTreeFromCode(rawCode);
  const lineCount = rawCode.split('\n').length;

  useEffect(() => { initMermaid(theme); }, [theme]);
  useEffect(() => { localStorage.setItem('mermaid_editor_code', rawCode); }, [rawCode]);
  useEffect(() => { localStorage.setItem('mermaid_doc_content', docContent); }, [docContent]);

  const handleImport = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (/```mermaid/.test(content)) {
        setDocContent(content);
        setViewMode('document');
        toast.success(`Import OK! ${(content.match(/```mermaid/g) || []).length} diagram.`, { icon: '📊' });
      } else {
        setRawCode(content);
        setViewMode('editor');
        toast.success('Import OK!', { icon: '✅' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleUpdateBlock = useCallback((blockIndex: number, newContent: string) => {
    const newBlocks = docBlocks.map(b => b.index === blockIndex ? { ...b, content: newContent } : b);
    setDocContent(blocksToMarkdown(newBlocks));
  }, [docBlocks]);

  const handleExpandDiagram = useCallback((blockIndex: number) => {
    if (viewMode === 'editor') {
      setExpandedDiagram({ index: 0, code: rawCode });
    } else {
      const block = docBlocks.find(b => b.index === blockIndex);
      if (block) setExpandedDiagram({ index: blockIndex, code: block.content });
    }
  }, [docBlocks, viewMode, rawCode]);

  const handleDiagramModalSave = useCallback((newCode: string) => {
    if (!expandedDiagram) return;
    if (viewMode === 'editor') {
      setRawCode(newCode);
    } else {
      handleUpdateBlock(expandedDiagram.index, newCode);
    }
    setExpandedDiagram(prev => prev ? { ...prev, code: newCode } : null);
    toast.success('Diagram đã lưu!', { icon: '✅' });
  }, [expandedDiagram, viewMode, handleUpdateBlock]);

  const currentBlocks = viewMode === 'document' ? docBlocks : [{ id: 'single', type: 'mermaid' as const, content: rawCode, index: 0 }];
  const docTitle = docContent.match(/^#\s+(.+)$/m)?.[1] || 'Mermaid Document';

  const handleExportMd = useCallback(() => {
    const content = viewMode === 'document' ? docContent : wrapInMarkdown(rawCode);
    dl(new Blob([content], { type: 'text/markdown' }), 'document.md');
    toast.success('Export Markdown!', { icon: '📝' });
  }, [viewMode, docContent, rawCode]);

  const handleExportPdf = useCallback(async () => {
    setExporting(true);
    try { await exportDocumentPdf(currentBlocks, docTitle); } catch { toast.error('Lỗi export'); }
    setExporting(false);
  }, [currentBlocks, docTitle]);

  const handleExportWord = useCallback(async () => {
    setExporting(true);
    try { await exportDocumentWord(currentBlocks, docTitle); toast.success('Export Word OK!', { icon: '📃' }); } catch { toast.error('Lỗi export'); }
    setExporting(false);
  }, [currentBlocks, docTitle]);

  const handleExportHtml = useCallback(async () => {
    setExporting(true);
    try { await exportDocumentHtml(currentBlocks, docTitle); toast.success('Export HTML OK!', { icon: '🌐' }); } catch { toast.error('Lỗi export'); }
    setExporting(false);
  }, [currentBlocks, docTitle]);

  const handleExportSvg = useCallback(() => {
    const svgEl = document.querySelector('[class*="diagram"] svg, .diagram-container svg') as SVGElement;
    if (!svgEl) { toast.error('Không tìm thấy diagram'); return; }
    dl(new Blob([new XMLSerializer().serializeToString(svgEl)], { type: 'image/svg+xml' }), 'diagram.svg');
  }, []);

  const handleExportPng = useCallback(async () => {
    const svgEl = document.querySelector('[class*="diagram"] svg, .diagram-container svg') as SVGElement;
    if (!svgEl) { toast.error('Không tìm thấy diagram'); return; }
    try { dl(await exportToPng(svgEl), 'diagram.png'); } catch { toast.error('Lỗi export'); }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-200 transition-colors">
      <input ref={fileInputRef} type="file" accept=".md,.markdown,.mmd,.txt" onChange={handleFileChange} className="hidden" />

      <header className="shrink-0 flex items-center justify-between px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131923]">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-slate-400 hover:text-orange-500 transition-colors p-1.5 bg-white dark:bg-[#1f2937] rounded-lg border border-slate-200 dark:border-slate-700" title="Về Portal"><CornerUpLeft size={16} /></Link>
          <span className="text-sm font-black text-slate-800 dark:text-white">📐 Mermaid Editor</span>
          <div className="flex bg-slate-100 dark:bg-[#1f2937] rounded-lg p-0.5 ml-2">
            <button onClick={() => setViewMode('editor')} className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${viewMode === 'editor' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-orange-500'}`}><Code2 size={11} className="inline mr-1" />Editor</button>
            <button onClick={() => setViewMode('document')} className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${viewMode === 'document' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-orange-500'}`}><BookOpen size={11} className="inline mr-1" />Document</button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowSamples(p => !p)} className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${showSamples ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-orange-500'}`} title="Sample diagrams">📋</button>
          <Link to="/mermaid-tutorial" className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-500 hover:text-orange-500 transition-all" title="Tutorial"><HelpCircle size={14} /></Link>
          <button onClick={handleImport} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-500 hover:text-orange-500 transition-all"><Upload size={12} /> Import</button>
          <div className="relative group">
            <button disabled={exporting} className="flex items-center gap-1 px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 shadow-sm"><Download size={12} /> {exporting ? '...' : 'Export'}</button>
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="px-2 py-1 text-[9px] font-bold text-orange-500 uppercase tracking-widest">Full Document</div>
              <ExportBtn onClick={handleExportPdf} icon={<FileDown size={12} />} label="PDF" />
              <ExportBtn onClick={handleExportWord} icon={<FileType size={12} />} label="Word (.doc)" />
              <ExportBtn onClick={handleExportHtml} icon={<FileCode size={12} />} label="HTML" />
              <ExportBtn onClick={handleExportMd} icon={<FileText size={12} />} label="Markdown" />
              <div className="border-t border-slate-200 dark:border-slate-800 my-0.5" />
              <div className="px-2 py-1 text-[9px] font-bold text-orange-500 uppercase tracking-widest">Single Diagram</div>
              <ExportBtn onClick={handleExportSvg} icon={<FileCode size={12} />} label="SVG" />
              <ExportBtn onClick={handleExportPng} icon={<Image size={12} />} label="PNG" />
            </div>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />
          <button onClick={() => setShowTree(p => !p)} className={`p-1.5 rounded-lg transition-all ${showTree ? 'text-orange-500 bg-orange-500/10' : 'text-slate-400 hover:text-orange-500'}`} title="Tree View">{showTree ? <PanelLeftClose size={14} /> : <PanelLeft size={14} />}</button>
          <button onClick={toggleTheme} className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 transition-all" title="Toggle theme">{theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}</button>
        </div>
      </header>

      {showSamples && (
        <div className="shrink-0 px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131923]">
          <SampleSelector onSelect={(c) => { setRawCode(c); setViewMode('editor'); setShowSamples(false); }} />
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {showTree && (
          <div className="w-48 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131923] overflow-auto">
            {viewMode === 'editor' ? (
              <TreeViewPanel tree={editorTree} />
            ) : (
              <div className="p-1.5 space-y-0.5">
                {docBlocks.map((b, i) => (
                  <div key={b.id} className={`text-[10px] px-2 py-1 rounded-md truncate cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1a2332] transition-colors ${b.type === 'mermaid' ? 'text-orange-500 font-bold' : 'text-slate-500'}`}>
                    {b.type === 'mermaid' ? `📊 #${docBlocks.filter((x, j) => j <= i && x.type === 'mermaid').length}` : `📝 ${b.content.split('\n')[0].replace(/^#+\s*/, '').slice(0, 24)}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'editor' ? (
          <div className="flex-1 flex min-w-0">
            <div className="flex-1 min-w-0">
              <EditorPanel code={rawCode} onChange={setRawCode} error={null} lineCount={lineCount} />
            </div>
            <div className="flex-1 min-w-0 overflow-auto bg-white dark:bg-[#131923] border-l border-slate-200 dark:border-slate-800 p-4">
              <DocumentView
                blocks={[{ id: 'single', type: 'mermaid', content: rawCode, index: 0 }]}
                theme={theme}
                onUpdateBlock={() => {}}
                onExpandDiagram={() => handleExpandDiagram(0)}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex min-w-0">
            <div className="w-[40%] shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-[#131923]">
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1f2937] shrink-0">
                <Code2 size={12} className="text-orange-500" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Source</span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-[#0d1117] px-1.5 py-0.5 rounded-full">{docContent.split('\n').length}L · {docBlocks.filter(b => b.type === 'mermaid').length}D</span>
              </div>
              <textarea
                value={docContent}
                onChange={e => setDocContent(e.target.value)}
                spellCheck={false}
                className="flex-1 bg-transparent text-slate-800 dark:text-slate-200 font-mono text-[12px] leading-[20px] p-3 resize-none outline-none overflow-auto caret-orange-500"
                style={{ tabSize: 4 }}
              />
            </div>
            <div className="flex-1 min-w-0 overflow-auto bg-white dark:bg-[#131923] p-4">
              <DocumentView blocks={docBlocks} theme={theme} onUpdateBlock={handleUpdateBlock} onExpandDiagram={handleExpandDiagram} />
            </div>
          </div>
        )}
      </div>

      {expandedDiagram && (
        <DiagramModal
          code={expandedDiagram.code}
          index={viewMode === 'editor' ? 0 : docBlocks.filter(b => b.type === 'mermaid').findIndex(b => b.index === expandedDiagram.index)}
          theme={theme}
          onSave={handleDiagramModalSave}
          onClose={() => setExpandedDiagram(null)}
        />
      )}
    </div>
  );
};

const ExportBtn = ({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button onClick={onClick} className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a2332] hover:text-orange-500 rounded-md transition-all">{icon} {label}</button>
);

function dl(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
