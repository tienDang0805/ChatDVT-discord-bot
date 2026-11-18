export type StationId = 'codex' | 'proxy' | 'google' | 'sandbox';
export type Tone = 'blue' | 'green' | 'purple' | 'amber' | 'cyan' | 'red';
export type ConfigFileId = 'codex' | 'cliproxy' | 'agents' | 'sol61' | 'windows';

export interface StationSpec {
  id: StationId;
  stepNumber: string;
  stepLabel: string;
  title: string;
  subtitle: string;
  shortDesc: string;
  pill: string;
  tone: Tone;
  isCore?: boolean;
  defaultConfigId: ConfigFileId;
  whatItDoes: string;
  whyWeTunedIt: string;
  ifWrong: string;
  keyMetrics: Array<{ label: string; value: string; note: string }>;
}

export interface FlowStepSpec {
  title: string;
  summary: string;
  activeStations: StationId[];
  activeEdge: '01-02' | '02-03' | '03-04' | '04-01';
  edgeLabel: string;
  highlightModels: Array<'hydrogen' | 'carbon' | 'flash'>;
}

export interface ScenarioSpec {
  id: 'normal' | 'carbon' | 'sandbox';
  label: string;
  hint: string;
  tone: Tone;
  steps: FlowStepSpec[];
}

export interface PromptLayerSpec {
  id: string;
  order: string;
  title: string;
  source: string;
  approxTokens: number;
  color: Tone;
  summary: string;
  details: string[];
}

export interface ModelBubbleSpec {
  slug: string;
  displayName: string;
  brand: 'gemini' | 'claude';
  speed: number;
  iq: number;
  quotaCost: string;
  radius: number;
  ctx: string;
  role: string;
  color: Tone;
}

export interface ConfigStudioFile {
  id: ConfigFileId;
  label: string;
  title: string;
  path: string;
  language: 'toml' | 'yaml' | 'md' | 'shell';
  note: string;
  code: string;
  annotations: Record<number, string>;
}

export const STATIONS: StationSpec[] = [
  {
    id: 'codex',
    stepNumber: '01',
    stepLabel: 'Bước 1',
    title: 'Codex Desktop',
    subtitle: 'App bạn gõ lệnh',
    shortDesc: 'Đóng gói câu hỏi + luật làm việc, giữ mạch tới 340k chữ.',
    pill: 'macOS App · Nhớ 340k chữ',
    tone: 'blue',
    defaultConfigId: 'codex',
    whatItDoes:
      'Nhận câu lệnh từ bạn, ghép 5 lớp chỉ dẫn (sol61 + AGENTS.md + quyền thư mục + danh sách công cụ + lịch sử chat), rồi gửi xuống cổng :8317.',
    whyWeTunedIt:
      'Nâng ngưỡng tự nén từ 280k (70% ≈ 196k) lên 400k (85% ≈ 340k) để tận dụng cửa sổ 1M của Hydrogen; nới thời gian chờ SSE lên 30 phút và tắt WebSocket hay treo.',
    ifWrong:
      'Để mặc định 5 phút sẽ đứt luồng giữa chừng khi AI nghĩ lâu; để ngưỡng nén quá thấp sẽ rơi mất code đầu phiên.',
    keyMetrics: [
      { label: 'Ngưỡng nén Hydrogen', value: '400,000 (85%)', note: 'Tự tóm tắt ở ~340k, giữ mạch code dài' },
      { label: 'Chờ luồng SSE', value: '1,800,000 ms', note: '30 phút — dứt điểm lỗi rớt mạng ở phút thứ 5' },
      { label: 'WebSocket', value: 'false', note: 'Chặn rò rỉ 8 socket treo ngầm 4 giờ' },
      { label: 'Tool Output & Doc', value: '20k / 64 KB', note: 'Giảm 20% rác log và nhân đôi giới hạn AGENTS.md' },
    ],
  },
  {
    id: 'proxy',
    stepNumber: '02',
    stepLabel: 'Bước 2',
    title: 'Trạm Proxy :8317',
    subtitle: 'CLIProxyAPI v8.0.67',
    shortDesc: 'Dịch lệnh sang chuẩn Google, giữ kết nối sống 30 phút.',
    pill: 'Homebrew · Nhịp 15s',
    tone: 'green',
    defaultConfigId: 'cliproxy',
    whatItDoes:
      'Đứng giữa ở cổng 8317: dịch chuẩn OpenAI Responses của Codex sang Google Antigravity, chia chung slot đăng nhập cho subagent và gửi nhịp keepalive mỗi 15 giây.',
    whyWeTunedIt:
      'Dịch vụ Homebrew đọc /opt/homebrew/etc/cliproxyapi.conf còn bạn hay sửa ~/.cli-proxy-api/config.yaml, nên đã nối symlink làm một và đặt tên hiển thị riêng cho từng alias.',
    ifWrong:
      'Không nối symlink sẽ bị lệch hai bản cấu hình; trùng display-name làm menu chọn model hiện 2 dòng Hydrogen giống hệt nhau.',
    keyMetrics: [
      { label: 'Một file cấu hình', value: 'yaml → .conf', note: 'Symlink hợp nhất, sửa ở đâu cũng tự nạp lại' },
      { label: 'Giữ chung phiên', value: '1h + Subagents', note: 'Agent con dùng chung slot OAuth giữ cache' },
      { label: 'Tách tên 3 Alias', value: '3 slug riêng tên', note: 'codex-auto-review, gpt-5.6-luna, gpt-6-luna' },
      { label: 'Apply Patch UI', value: 'enabled: true', note: 'Hiện thẻ File Change có nút Undo' },
    ],
  },
  {
    id: 'google',
    stepNumber: '03',
    stepLabel: 'Bước 3',
    title: 'Antigravity AI',
    subtitle: 'Bộ não chọn model',
    shortDesc: 'Hydrogen chạy 90% việc nhanh; chỉ 10% ca khó gọi Carbon.',
    pill: 'Hydrogen 90% · Carbon 10%',
    tone: 'purple',
    isCore: true,
    defaultConfigId: 'agents',
    whatItDoes:
      'Trung tâm xử lý AI trên tài khoản gavangdagia1: Hydrogen lo 90% việc hằng ngày, đội phụ chỉ bật khi sửa từ 3 module trở lên, còn Carbon chỉ xuất hiện ở 10% ca kiến trúc khó.',
    whyWeTunedIt:
      'Đảo chiều điều phối: lấy Hydrogen làm model chính để nhanh gấp 2.5–4 lần và tiết kiệm ~70% quota 5 giờ; profile Carbon chặn sớm ở 360k để tránh chờ prefill quá 10 phút.',
    ifWrong:
      'Dùng Carbon cho mọi câu hỏi sẽ chậm 3–10 phút/lượt và đốt sạch quota sớm; dùng fork_turns="all" cho việc nhỏ sẽ nhân bản token vô ích.',
    keyMetrics: [
      { label: 'Main Driver', value: 'Hydrogen (high)', note: 'IQ 51–54, nhanh 2.5–4x, tiết kiệm ~70% quota' },
      { label: 'Subagents (×4)', value: 'fork_turns="none"', note: 'Chỉ bật khi quét/sửa >= 3 module song song' },
      { label: 'Carbon Escalate', value: 'architect (360k)', note: 'Dùng cho ca race condition / thiết kế phức tạp' },
      { label: 'Nền & Ảnh', value: '3.8 Tiered / 3.1 Img', note: 'Guardian dùng Flash Tiered, vẽ ảnh dùng 3.1 Image' },
    ],
  },
  {
    id: 'sandbox',
    stepNumber: '04',
    stepLabel: 'Bước 4',
    title: 'Hộp Cát & Cầu MCP',
    subtitle: 'Chạy lệnh · GitHub · Windows',
    shortDesc: 'Sửa code có Undo trong máy, ra mạng qua cầu MCP & gói Windows.',
    pill: 'Undo · MCP · Windows Sync',
    tone: 'amber',
    defaultConfigId: 'windows',
    whatItDoes:
      'Giữ lệnh shell an toàn trong thư mục dự án bằng macOS Seatbelt; mọi thao tác GitHub, web, trình duyệt đi qua cầu MCP của app mẹ, và đồng bộ nguyên cấu hình sang máy Windows.',
    whyWeTunedIt:
      'Tắt 33 skill game không dùng để prompt nhẹ đi rõ rệt, đồng thời đóng gói sẵn codex-windows-sync-pack.zip giữ nguyên auth gavangdagia1 cho em bạn chạy 1 click.',
    ifWrong:
      'Để AI tự chạy curl hoặc /bin/ps trong sandbox sẽ vướng chặn Operation not permitted ngay lập tức.',
    keyMetrics: [
      { label: 'Seatbelt Mode', value: 'workspace-write', note: 'Ưu tiên apply_patch (Undo) và rg' },
      { label: 'Host MCP Bridge', value: '14 Plugins bật', note: 'GitHub, Web Search, Node/CUA, LaTeX, Docs' },
      { label: 'Skills đã lọc', value: '11 bật · 33 tắt', note: 'Loại bỏ 33 skill game để giảm nhiễu prompt' },
      { label: 'Windows Sync', value: 'codex-windows-sync', note: 'Giữ nguyên auth chung, chỉ 1 click cập nhật' },
    ],
  },
];

export const SCENARIOS: ScenarioSpec[] = [
  {
    id: 'normal',
    label: '1. Việc hằng ngày (90%)',
    hint: 'Việc 1–3 file chạy thẳng qua Hydrogen, nhanh gấp 2.5–4 lần và trả về thẻ sửa code có nút Undo.',
    tone: 'cyan',
    steps: [
      {
        title: 'Bạn gõ lệnh',
        summary: 'Việc 1–3 file không đẻ thêm agent phụ, giữ nguyên một mạch hội thoại nên không tốn token lặp.',
        activeStations: ['codex', 'proxy'],
        activeEdge: '01-02',
        edgeLabel: '1. Gửi câu lệnh',
        highlightModels: ['hydrogen'],
      },
      {
        title: 'Hydrogen giải quyết',
        summary: 'Proxy giữ chung một luồng và đẩy thẳng cho Gemini 4 Hydrogen ở mức high, nhanh gấp 2.5–4 lần.',
        activeStations: ['proxy', 'google'],
        activeEdge: '02-03',
        edgeLabel: '2. Hydrogen chạy (Nhanh 3x)',
        highlightModels: ['hydrogen'],
      },
      {
        title: 'Trả kết quả có Undo',
        summary: 'AI sửa file an toàn trong hộp cát rồi trả thẻ thay đổi kèm nút Undo lên màn hình Codex.',
        activeStations: ['google', 'sandbox', 'codex'],
        activeEdge: '04-01',
        edgeLabel: '3. Sửa code có Undo',
        highlightModels: ['hydrogen'],
      },
    ],
  },
  {
    id: 'carbon',
    label: '2. Ca khó & Chống rớt mạng',
    hint: 'Lỗi kiến trúc phức tạp được chuyển riêng cho Carbon; đường truyền giữ nhịp 15s và chờ tối đa 30 phút.',
    tone: 'purple',
    steps: [
      {
        title: 'Mở ống chờ 30 phút',
        summary: 'Codex nới ngưỡng chờ từ 5 phút lên 30 phút và tắt WebSocket treo ngầm, dứt điểm lỗi rớt luồng SSE.',
        activeStations: ['codex', 'proxy'],
        activeEdge: '01-02',
        edgeLabel: '1. Chờ tối đa 30 phút',
        highlightModels: ['hydrogen', 'carbon'],
      },
      {
        title: 'Gọi Carbon gỡ nút thắt',
        summary: 'Hydrogen chưng cất đúng phần lỗi rồi gọi riêng Architect (Carbon), không nhân bản lịch sử chat cũ.',
        activeStations: ['proxy', 'google'],
        activeEdge: '02-03',
        edgeLabel: '2. Leo thang Carbon (360k)',
        highlightModels: ['carbon'],
      },
      {
        title: 'Giữ nhịp 15s & trả bản vá',
        summary: 'Trong lúc Carbon nghĩ sâu, proxy gõ nhịp mỗi 15 giây để giữ sống kết nối rồi trả bản vá về phiên chính.',
        activeStations: ['google', 'sandbox', 'codex'],
        activeEdge: '04-01',
        edgeLabel: '3. Nhịp 15s · Trả kết quả',
        highlightModels: ['carbon'],
      },
    ],
  },
  {
    id: 'sandbox',
    label: '3. Đụng mạng & Cầu MCP',
    hint: 'Hộp cát chặn lệnh tự ý ra mạng hoặc ra ngoài thư mục; mọi việc GitHub, Chrome, vẽ ảnh đi qua cầu MCP an toàn.',
    tone: 'amber',
    steps: [
      {
        title: 'Chặn ở rào bảo vệ',
        summary: 'Hộp cát macOS chặn AI tự chạy curl gọi :8317, đọc /bin/ps hay sửa file ngoài thư mục dự án.',
        activeStations: ['google', 'sandbox'],
        activeEdge: '03-04',
        edgeLabel: '1. Kiểm tra hộp cát',
        highlightModels: ['hydrogen'],
      },
      {
        title: 'Flash duyệt an toàn',
        summary: 'Khi cần xin quyền ngoài hộp cát, Guardian dùng Gemini 3.8 Flash Tiered chấm nhanh trong tích tắc.',
        activeStations: ['sandbox', 'proxy', 'google'],
        activeEdge: '02-03',
        edgeLabel: '2. Flash duyệt tự động',
        highlightModels: ['flash'],
      },
      {
        title: 'Chạy qua cầu MCP / Ảnh',
        summary: 'GitHub, Chrome, Web Search hoặc script vẽ ảnh 3.1 Flash Image chạy qua app mẹ rồi trả kết quả về.',
        activeStations: ['sandbox', 'codex'],
        activeEdge: '04-01',
        edgeLabel: '3. Cầu GitHub · Chrome · Ảnh',
        highlightModels: ['flash', 'hydrogen'],
      },
    ],
  },
];

export const PROMPT_LAYERS: PromptLayerSpec[] = [
  {
    id: 'layer-1',
    order: 'L1',
    title: 'Base Prompt (Ghi đè prompt gốc)',
    source: '~/.codex/sol61_instructions.md (27.9 KB)',
    approxTokens: 7200,
    color: 'purple',
    summary: 'Thay hoàn toàn chỉ dẫn mặc định của gpt-6.1-sol bằng quy tắc làm việc thực tế của bạn.',
    details: [
      'Two-Tier Reporting: chat gọn dễ đọc, chi tiết code/dòng đưa vào file .md.',
      'Luôn ưu tiên apply_patch để có thẻ Undo, dùng MCP thay cho curl bị chặn.',
      'Đặt Hydrogen làm driver chính cho việc 1–3 file.',
    ],
  },
  {
    id: 'layer-2',
    order: 'L2',
    title: 'Runtime Tags (App tự gắn)',
    source: 'Codex Desktop 26.1106 (Mỗi lượt gửi)',
    approxTokens: 4500,
    color: 'blue',
    summary: 'Chứa quyền sandbox, danh sách 11 skill đang bật và thẻ <multi_agent_mode>.',
    details: [
      '<permissions>: workspace-write + auto_review.',
      '<multi_agent_mode>: Cấm tự ý đẻ subagent nếu không có chỉ thị trong AGENTS.md.',
      'Nhờ tắt 33 skill game, lớp này nhẹ và không bị loãng.',
    ],
  },
  {
    id: 'layer-3',
    order: 'L3',
    title: 'AGENTS.md (Luật điều phối)',
    source: '~/.codex/AGENTS.md (Max 64 KB)',
    approxTokens: 600,
    color: 'green',
    summary: 'Cho phép chia việc song song đúng lúc, vượt rào <multi_agent_mode> một cách kiểm soát.',
    details: [
      '1–3 file: làm thẳng trên Hydrogen (0 subagent).',
      '>= 3 module độc lập: chia explorer (medium) + worker (high) với fork_turns="none".',
      'Điểm nghẽn khó: leo thang architect (Carbon high).',
    ],
  },
  {
    id: 'layer-4',
    order: 'L4',
    title: 'Tool & MCP Schemas',
    source: '14 Plugins + 5 MCP Servers',
    approxTokens: 8500,
    color: 'amber',
    summary: 'Định nghĩa các công cụ AI được gọi: shell, apply_patch, GitHub, Web Search, Node/CUA, LaTeX.',
    details: [
      'Mỗi kết quả tool bị chặn trần ở 20,000 token (~80 KB) tránh tràn ngữ cảnh vì 1 file log lớn.',
    ],
  },
  {
    id: 'layer-5',
    order: 'L5',
    title: 'Lịch sử Chat & Auto-Compact',
    source: 'Ngữ cảnh trượt (0 → 400k / 996k)',
    approxTokens: 120000,
    color: 'cyan',
    summary: 'Tin nhắn, file đã đọc và diff. Tự tóm tắt trước vùng Context Rot (>500k).',
    details: [
      'Hydrogen nén ở 400,000 (post-turn 85% ≈ 340k) thay vì 280k/70% (168k–196k) quá chật trước kia.',
      'Carbon nén sớm hơn ở 360,000 để tránh chờ prefill trên 10 phút.',
    ],
  },
];

export const MODEL_BUBBLES: ModelBubbleSpec[] = [
  {
    slug: 'gemini-4-hydrogen-xhigh',
    displayName: 'Gemini 4 Hydrogen',
    brand: 'gemini',
    speed: 84,
    iq: 88,
    quotaCost: 'Thấp',
    radius: 28,
    ctx: '1M (compact 400k)',
    role: 'Main Driver 90% + /review + explorer/worker. Nhanh gấp 2.5–4x Carbon, tiết kiệm ~70% quota.',
    color: 'cyan',
  },
  {
    slug: 'gemini-4-carbon-high',
    displayName: 'Gemini 4 Carbon',
    brand: 'gemini',
    speed: 32,
    iq: 98,
    quotaCost: 'Cao (3-4x)',
    radius: 24,
    ctx: '1M (compact 360k)',
    role: 'Chuyên trị 10% ca khó: race condition, kiến trúc đa tầng. Prefill có thể mất 3–10 phút.',
    color: 'purple',
  },
  {
    slug: 'gemini-3.8-flash-tiered',
    displayName: 'Gemini 3.8 Flash Tiered',
    brand: 'gemini',
    speed: 95,
    iq: 64,
    quotaCost: 'Rất thấp',
    radius: 20,
    ctx: '1M',
    role: 'Chạy nền cho Guardian (codex-auto-review) và đặt tên chat (gpt-5.6-luna).',
    color: 'green',
  },
  {
    slug: 'gemini-4-argon-high',
    displayName: 'Gemini 4 Argon',
    brand: 'gemini',
    speed: 68,
    iq: 78,
    quotaCost: 'Trung bình',
    radius: 16,
    ctx: '1M',
    role: 'Đời trước (IQ 50). Hiện bị Hydrogen vượt cả tốc độ lẫn độ thông minh.',
    color: 'blue',
  },
  {
    slug: 'gemini-3.1-flash-image',
    displayName: '3.1 Flash Image',
    brand: 'gemini',
    speed: 74,
    iq: 58,
    quotaCost: 'Thấp',
    radius: 17,
    ctx: '500k',
    role: 'Vẽ ảnh chuyên biệt qua gemini_image_gen.cjs (/v1/chat/completions).',
    color: 'amber',
  },
  {
    slug: 'claude-opus-4-6-thinking',
    displayName: 'Claude 4.6 Opus',
    brand: 'claude',
    speed: 48,
    iq: 91,
    quotaCost: 'Cao (3-4x)',
    radius: 18,
    ctx: '200k',
    role: 'Lựa chọn dự phòng qua Antigravity, nhưng cửa sổ chỉ 200k (nhỏ hơn Gemini 5 lần).',
    color: 'amber',
  },
];

export const HARNESS_INVENTORY = {
  insideSandbox: [
    { name: 'apply_patch', detail: 'Sửa code an toàn + hiện thẻ Undo trên Desktop' },
    { name: 'exec_command', detail: 'Đọc/ghi trong cwd, ~/Documents/Codex và /tmp' },
    { name: 'Bị Seatbelt chặn', detail: '/bin/ps, curl :8317, sửa file ngoài workspace' },
  ],
  hostBridgeMcp: [
    { name: 'GitHub & Web Search', detail: 'Chạy ở app mẹ nên vượt sạch chặn mạng' },
    { name: 'node_repl & cua_repl', detail: 'Playwright, điều khiển trình duyệt & app macOS' },
    { name: 'gemini_image_gen.cjs', detail: 'Xin quyền require_escalated để gọi :8317 vẽ ảnh' },
  ],
  enabledPlugins: [
    'browser', 'unified-computer-use', 'computer-use', 'visualize', 'chrome',
    'documents', 'pdf', 'spreadsheets', 'presentations', 'template-creator',
    'github', 'plugin-management', 'work-pets', 'codex-app-tools',
  ],
  enabledSkills: [
    'animate', 'apple-hig-design', 'emil-apple-motion', 'emil-design-eng',
    'gestures', 'huashu-design', 'impeccable', 'mobile-design', 'mobile-native',
    'openai-docs', 'skill-installer',
  ],
  disabledSkillsCount: 33,
};

export const CONFIG_STUDIO_FILES: ConfigStudioFile[] = [
  {
    id: 'codex',
    label: 'config.toml',
    title: 'Codex Core & Provider Config',
    path: '~/.codex/config.toml',
    language: 'toml',
    note: 'Đặt Hydrogen làm mặc định, nới timeout SSE 30 phút, tắt WebSocket và compact 400k (85%).',
    code: `model = "gemini-4-hydrogen-xhigh"
model_provider = "cliproxy"
review_model = "gemini-4-hydrogen-xhigh"
model_reasoning_effort = "high"
model_context_window = 1048576
model_auto_compact_token_limit = 400000
model_post_turn_compact_threshold_percent = 85
tool_output_token_limit = 20000
project_doc_max_bytes = 65536
model_instructions_file = "/Users/qmacstore/.codex/sol61_instructions.md"

[model_providers.cliproxy]
base_url = "http://127.0.0.1:8317/v1"
wire_api = "responses"
stream_idle_timeout_ms = 1800000
supports_websockets = false`,
    annotations: {
      1: 'Driver mặc định nhanh 2.5–4x',
      6: 'Nén ở 40% cửa sổ 1M thay vì 280k',
      7: 'Post-turn nén ở ~340k',
      8: 'Cắt bớt rác log (~80KB/lệnh)',
      15: '30 phút — dứt điểm lỗi đứt SSE',
      16: 'Chặn 8 socket WebSocket treo ngầm',
    },
  },
  {
    id: 'cliproxy',
    label: 'cliproxyapi.conf',
    title: 'CLIProxyAPI v8 Unified Config',
    path: '/opt/homebrew/etc/cliproxyapi.conf (↔ ~/.cli-proxy-api/config.yaml)',
    language: 'yaml',
    note: 'Hợp nhất qua symlink, chia slot affinity cho subagent, keepalive 15s và tách tên alias.',
    code: `config-version: 8
routing:
  session-affinity: true
  session-affinity-subagents: true
  session-affinity-rebind-on: "quota"
requests:
  streaming:
    keepalive-seconds: 15
    bootstrap-retries: 2
    send-keepalive-before-ft: true
client:
  codex:
    enable-apply-patch: true
    optimize-multi-agent-v2: true
oauth:
  model-alias:
    antigravity:
      - name: "gemini-3.8-flash-tiered"
        alias: "codex-auto-review"
        display-name: "Codex Auto Review (Flash Tiered)"
      - name: "gemini-3.8-flash-tiered"
        alias: "gpt-5.6-luna"
        display-name: "GPT-5.6 Luna (Codex Title/BG)"
      - name: "gemini-4-hydrogen-xhigh"
        alias: "gpt-6-luna"
        display-name: "GPT-6 Luna (Codex Guardian)"`,
    annotations: {
      4: 'Subagent dùng chung slot auth với cha',
      8: 'Giữ TCP sống mỗi 15 giây',
      13: 'Hiện nút Undo File Change',
      20: 'Tách tên tránh trùng menu UI',
      26: 'Không còn 2 dòng Hydrogen giống nhau',
    },
  },
  {
    id: 'agents',
    label: 'AGENTS & Carbon',
    title: 'Luật Điều Phối & Profile Carbon',
    path: '~/.codex/AGENTS.md + agents/*.toml + carbon.config.toml',
    language: 'toml',
    note: 'Phân tầng Hydrogen làm việc thường, chia explorer/worker cho việc lớn và Carbon cho ca khó.',
    code: `# ~/.codex/AGENTS.md
# 1) 1–3 file -> Hydrogen làm thẳng (0 subagent)
# 2) >= 3 module độc lập -> explorer (medium) + worker (high), fork_turns="none"
# 3) Nghẽn kiến trúc -> architect (Carbon high), fork_turns="none"

[agents.explorer]
config_file = "./agents/explorer.toml"

[agents.worker]
config_file = "./agents/worker.toml"

[agents.architect]
config_file = "./agents/architect.toml"

# ~/.codex/carbon.config.toml (codex -p carbon)
model = "gemini-4-carbon-high"
model_reasoning_effort = "high"
model_auto_compact_token_limit = 360000`,
    annotations: {
      2: 'Tránh đẻ agent thừa cho việc nhỏ',
      3: 'fork_turns="none" chống đốt token',
      18: 'Chặn ở 360k né prefill >10 phút',
    },
  },
  {
    id: 'sol61',
    label: 'sol61_instructions.md',
    title: 'Base System Prompt Override',
    path: '~/.codex/sol61_instructions.md (27.9 KB)',
    language: 'md',
    note: 'Quy định cách trình bày gọn trong chat, ưu tiên apply_patch và dùng MCP thay curl.',
    code: `# Tooling, MCP Harness, and Hydrogen-Carbon P/P Rules

- Default main driver: gemini-4-hydrogen-xhigh at high effort
- Handle <= 3-file tasks directly with zero subagent overhead
- Escalate architectural bottlenecks to architect (Carbon high, fork_turns="none")
- Always use apply_patch first so Codex Desktop shows the Undo card
- Use MCP host tools (github___*, search_service___web_run) instead of curl in Seatbelt
- Image gen: node ~/.codex/gemini_image_gen.cjs via POST :8317/v1/chat/completions`,
    annotations: {
      3: 'Driver mặc định mới (thay Argon cũ)',
      6: 'Giữ thẻ Undo trên giao diện',
      7: 'Vượt tường Seatbelt qua MCP Host',
    },
  },
  {
    id: 'windows',
    label: 'Windows Sync',
    title: 'Gói Cập Nhật Cho Máy Windows',
    path: 'outputs/codex-windows-sync-pack.zip (RUN-UPDATE.bat)',
    language: 'shell',
    note: 'Đồng bộ cấu hình hôm nay sang máy Windows của em bạn mà vẫn giữ nguyên OAuth gavangdagia1.',
    code: `# Giải nén codex-windows-sync-pack.zip rồi chạy RUN-UPDATE.bat
1. Tự sao lưu config.toml & config.yaml cũ trên Windows
2. Giữ nguyên auth.json & token gavangdagia1@gmail.com (không phải đăng nhập lại)
3. Cập nhật Hydrogen + Carbon + AGENTS.md + stream_idle_timeout_ms = 1800000
4. Đồng bộ alias tách tên cho CLIProxyAPI v8

# Gợi ý: nâng CLIProxyAPI.exe lên >= 8.0.69 trên Windows
# để giữ thoughtSignature qua nhiều lượt tool calls.`,
    annotations: {
      3: 'An toàn tuyệt đối cho auth chung',
      4: 'Đồng bộ y hệt máy macOS của bạn',
      7: 'Có bản vá thoughtSignature mới nhất',
    },
  },
];
