export type FeatureSection = 'developer' | 'ai' | 'learning' | 'productivity' | 'game' | 'community' | 'other';
export type FeatureVisibility = 'featured' | 'public' | 'archive' | 'unlisted' | 'private';
export type FeatureStatus = 'stable' | 'beta';
export type FeatureSurface = 'home' | 'projects' | 'mobile';

export interface FeatureDefinition {
  id: string;
  path: string;
  title: string;
  description: string;
  section: FeatureSection;
  visibility: FeatureVisibility;
  status: FeatureStatus;
  indexable: boolean;
  tags: string[];
  requirements?: string[];
  surfaces?: FeatureSurface[];
  homeRank?: number;
  featuredRank?: number;
}

/**
 * Canonical catalogue for public discovery and SEO. A route can stay available
 * without being promoted or indexed by setting it to archive/unlisted/private.
 */
export const FEATURE_CATALOG: FeatureDefinition[] = [
  {
    id: 'mobile-toolkit', path: '/mobile', title: 'Mobile Developer Toolkit',
    description: 'Bộ công cụ test Android, deep link, WebView, QR và tài liệu React Native dùng trong công việc hằng ngày.',
    section: 'developer', visibility: 'featured', status: 'stable', indexable: true,
    tags: ['React Native', 'Android', 'Debug'], requirements: ['Một số tool cần Chrome desktop'],
    surfaces: ['home', 'projects'], homeRank: 1, featuredRank: 1,
  },
  {
    id: 'chatdvt', path: '/discord', title: 'ChatDVT',
    description: 'Discord AI chatbot hỗ trợ hội thoại, phân tích media, tóm tắt và các mini game ngắn.',
    section: 'community', visibility: 'featured', status: 'stable', indexable: true,
    tags: ['Discord.js', 'Gemini', 'Prisma'], surfaces: ['home', 'projects'], homeRank: 2, featuredRank: 2,
  },
  {
    id: 'survivor', path: '/survivor-arena', title: 'Survivor Arena 8D',
    description: 'Auto-shooter roguelike gồm 50 đợt, boss và hệ thống nâng cấp kỹ năng.',
    section: 'game', visibility: 'featured', status: 'stable', indexable: true,
    tags: ['Canvas', 'Game loop', 'Touch'], surfaces: ['home', 'projects'], homeRank: 3, featuredRank: 3,
  },
  {
    id: 'english', path: '/english', title: 'English Learning Hub',
    description: 'Course map, flashcard, dictation, writing và hội thoại AI trong một learning hub.',
    section: 'learning', visibility: 'featured', status: 'beta', indexable: true,
    tags: ['Learning', 'AI', 'Local data'], requirements: ['Một số bài cần AI'], surfaces: ['projects'], featuredRank: 4,
  },
  {
    id: 'mermaid', path: '/mermaid-editor', title: 'Mermaid Editor',
    description: 'Soạn, preview, chỉnh style và export flowchart hoặc diagram ngay trên trình duyệt.',
    section: 'developer', visibility: 'featured', status: 'stable', indexable: true,
    tags: ['Diagram', 'Docs', 'Local'], surfaces: ['projects'], featuredRank: 5,
  },
  {
    id: 'chibi', path: '/chibi-sticker', title: 'Chibi Sticker AI',
    description: 'Biến ảnh thành bộ sticker chibi với nhiều style và pose.',
    section: 'ai', visibility: 'featured', status: 'beta', indexable: true,
    tags: ['Image', 'AI'], requirements: ['AI'], surfaces: ['projects'], featuredRank: 6,
  },

  // Public projects
  {
    id: 'cv', path: '/cv-review', title: 'CV Reviewer',
    description: 'Đánh giá CV, chấm điểm ATS và hỗ trợ viết lại nội dung bằng AI.',
    section: 'ai', visibility: 'public', status: 'beta', indexable: true,
    tags: ['Career', 'AI'], requirements: ['Upload file'], surfaces: ['projects'],
  },
  {
    id: 'quiz', path: '/quiz', title: 'Web Quiz AI',
    description: 'Tạo phòng quiz real-time và sinh câu hỏi theo chủ đề.',
    section: 'game', visibility: 'public', status: 'beta', indexable: true,
    tags: ['Multiplayer', 'AI'], requirements: ['Gemini key'], surfaces: ['projects'],
  },
  {
    id: 'note', path: '/note-daily', title: 'Note Daily',
    description: 'Ghi chú hằng ngày với calendar view và streak, dữ liệu lưu tại thiết bị.',
    section: 'productivity', visibility: 'public', status: 'stable', indexable: true,
    tags: ['Notes', 'Local-first'], requirements: ['Local data'], surfaces: ['projects'],
  },
  {
    id: 'detox', path: '/digital-detox', title: 'Digital Detox',
    description: 'Theo dõi thử thách giảm sử dụng mạng xã hội trong 30 ngày.',
    section: 'productivity', visibility: 'public', status: 'beta', indexable: true,
    tags: ['Habit', 'Local data'], surfaces: ['projects'],
  },
  {
    id: 'duel', path: '/tech-duel', title: 'So Kèo Công Nghệ',
    description: 'So sánh hai công nghệ và tóm tắt ưu, nhược điểm theo nhu cầu sử dụng.',
    section: 'developer', visibility: 'public', status: 'beta', indexable: true,
    tags: ['Research', 'AI'], requirements: ['AI'], surfaces: ['projects'],
  },
  {
    id: 'burnout', path: '/burnout-check', title: 'Burnout Check',
    description: 'Self-check ngắn để nhìn lại mức độ quá tải; không thay thế tư vấn y khoa.',
    section: 'productivity', visibility: 'public', status: 'beta', indexable: false,
    tags: ['Wellbeing', 'AI'], requirements: ['Không phải chẩn đoán y tế'], surfaces: ['projects'],
  },
  {
    id: 'poe2', path: '/poe2-trade-link', title: 'PoE2 Trade Link',
    description: 'Biến mô tả item thành query và link trade có cấu trúc.',
    section: 'developer', visibility: 'public', status: 'beta', indexable: true,
    tags: ['Parser', 'PoE2'], requirements: ['AI'], surfaces: ['projects'],
  },
  {
    id: 'poem', path: '/poem-generator', title: 'Poem Generator',
    description: 'Tạo thơ theo chủ đề, giọng điệu và thể thơ được chọn.',
    section: 'ai', visibility: 'public', status: 'beta', indexable: false,
    tags: ['Writing', 'AI'], requirements: ['AI'], surfaces: ['projects'],
  },
  {
    id: 'food', path: '/food-wheel', title: 'Food Wheel',
    description: 'Gợi ý món ăn và tạo một vòng quay chọn món vui vẻ.',
    section: 'ai', visibility: 'public', status: 'beta', indexable: false,
    tags: ['Food', 'AI'], requirements: ['AI'], surfaces: ['projects'],
  },

  // Mobile suite details: public and indexed, but listed inside /mobile only.
  {
    id: 'android-toolbox', path: '/android-toolbox', title: 'Android Device Toolbox',
    description: 'Kết nối Android qua USB để điều khiển app, test permission, chụp màn hình và lấy log.',
    section: 'developer', visibility: 'public', status: 'beta', indexable: true,
    tags: ['Android', 'WebUSB', 'Debug'], requirements: ['Chrome/Edge desktop', 'USB required'], surfaces: ['mobile'],
  },
  {
    id: 'deeplink', path: '/deeplink-tester', title: 'Deep Link Tester',
    description: 'Soạn và kiểm tra URI, tạo QR hoặc lệnh mở app trên iOS và Android.',
    section: 'developer', visibility: 'public', status: 'stable', indexable: true,
    tags: ['iOS', 'Android', 'Deep link'], surfaces: ['mobile'],
  },
  {
    id: 'webview', path: '/emulator-check', title: 'WebView Simulator',
    description: 'Dán HTML, CSS và JavaScript để xem nhanh trong khung thiết bị mobile.',
    section: 'developer', visibility: 'public', status: 'stable', indexable: true,
    tags: ['WebView', 'Debug'], requirements: ['Local only'], surfaces: ['mobile'],
  },
  {
    id: 'qr', path: '/qr-generator', title: 'QR Generator',
    description: 'Tạo mã QR có logo và màu riêng, sau đó tải xuống thành ảnh.',
    section: 'developer', visibility: 'public', status: 'stable', indexable: true,
    tags: ['QR', 'Testing'], requirements: ['Local only'], surfaces: ['mobile'],
  },
  {
    id: 'rn-guide', path: '/rn-learning-guide', title: 'React Native Guide',
    description: 'Roadmap thực chiến từ JavaScript/TypeScript đến architecture, testing và CI/CD.',
    section: 'learning', visibility: 'public', status: 'stable', indexable: true,
    tags: ['React Native', 'Guide'], surfaces: ['mobile'],
  },

  // Archive: still usable by direct URL, but deliberately de-emphasised and noindexed.
  { id: 'excuse', path: '/excuse-generator', title: 'Excuse Generator', description: 'Tạo lý do xin nghỉ và email mẫu bằng AI.', section: 'ai', visibility: 'archive', status: 'beta', indexable: false, tags: ['Writing', 'AI'] },
  { id: 'handsome', path: '/handsome', title: 'Handsome Analyzer', description: 'Demo AI nhận xét ảnh chân dung theo hướng giải trí.', section: 'ai', visibility: 'archive', status: 'beta', indexable: false, tags: ['Image', 'AI'] },
  { id: 'numerology', path: '/numerology', title: 'Numerology AI', description: 'Phân tích thần số học theo dữ liệu người dùng nhập.', section: 'ai', visibility: 'archive', status: 'beta', indexable: false, tags: ['Mystic', 'AI'] },
  { id: 'gender-quiz', path: '/gender-quiz', title: 'Personality Quiz AI', description: 'Quiz giải trí và phân tích phong cách bằng AI.', section: 'ai', visibility: 'archive', status: 'beta', indexable: false, tags: ['Quiz', 'AI'] },
  { id: 'astrology', path: '/astrology', title: 'Astrology AI', description: 'Demo phân tích cung hoàng đạo bằng AI.', section: 'ai', visibility: 'archive', status: 'beta', indexable: false, tags: ['Mystic', 'AI'] },
  { id: 'tarot', path: '/tarot', title: 'Tarot AI', description: 'Rút và giải nghĩa bài Tarot theo hướng giải trí.', section: 'ai', visibility: 'archive', status: 'beta', indexable: false, tags: ['Mystic', 'AI'] },
  { id: 'magic-ball', path: '/magic-ball', title: 'Magic Ball AI', description: 'Hỏi đáp ngẫu nhiên theo phong cách quả cầu pha lê.', section: 'ai', visibility: 'archive', status: 'beta', indexable: false, tags: ['Mystic', 'AI'] },
  { id: 'face-reader', path: '/face-reader', title: 'Face Reader AI', description: 'Demo giải trí phân tích ảnh khuôn mặt bằng AI.', section: 'ai', visibility: 'archive', status: 'beta', indexable: false, tags: ['Image', 'AI'] },
  { id: 'dream', path: '/dream-interpreter', title: 'Dream Interpreter', description: 'Diễn giải nội dung giấc mơ bằng AI.', section: 'ai', visibility: 'archive', status: 'beta', indexable: false, tags: ['Mystic', 'AI'] },
  { id: 'deep-status', path: '/deep-status', title: 'Deep Status', description: 'Tạo caption và status theo nhiều phong cách.', section: 'ai', visibility: 'archive', status: 'beta', indexable: false, tags: ['Writing', 'AI'] },
  { id: 'music', path: '/music', title: 'Music Station', description: 'Music player và playlist cá nhân bằng secret code.', section: 'other', visibility: 'archive', status: 'beta', indexable: false, tags: ['Music', 'Playlist'] },
  { id: 'flappy', path: '/flappy-bird', title: 'Flappy Bird 8D', description: 'Mini game Flappy Bird thử nghiệm trên trình duyệt.', section: 'game', visibility: 'archive', status: 'stable', indexable: false, tags: ['Game', 'Arcade'] },
  { id: 'chicken', path: '/chicken-game', title: 'Chicken Game', description: 'Mini game gà con giải trí trên trình duyệt.', section: 'game', visibility: 'archive', status: 'stable', indexable: false, tags: ['Game', 'Arcade'] },
  { id: 'cost', path: '/cost-study', title: 'Cost-effectiveness Study', description: 'Nghiên cứu chi phí – hiệu quả trong điều trị phù hoàng điểm.', section: 'other', visibility: 'archive', status: 'stable', indexable: false, tags: ['Research', 'Healthcare'] },
  { id: 'pd-guide', path: '/pd-learning-guide', title: 'Physical Design Guide', description: 'Tài liệu nền tảng từ floorplan đến timing closure và signoff.', section: 'learning', visibility: 'archive', status: 'stable', indexable: false, tags: ['VLSI', 'Guide'] },

  // Community/private context: available only when someone has the direct URL.
  { id: 'pixel-agents', path: '/pixel-agents', title: 'Pixel Agents 8D', description: 'Phòng chat pixel art real-time dành cho cộng đồng 8D.', section: 'community', visibility: 'unlisted', status: 'beta', indexable: false, tags: ['8D', 'Realtime'] },
  { id: 'monopoly', path: '/monopoly', title: 'Monopoly 8D', description: 'Mini game Monopoly dành cho nhóm 8D.', section: 'community', visibility: 'unlisted', status: 'beta', indexable: false, tags: ['8D', 'Game'] },
  { id: 'love8d', path: '/love8d', title: 'Love8D', description: 'Trang kỷ niệm riêng của cộng đồng 8D.', section: 'community', visibility: 'unlisted', status: 'stable', indexable: false, tags: ['8D'] },
  { id: 'tutien', path: '/tutien', title: 'Tu Tiên 8D', description: 'Idle RPG và hệ thống tu luyện dành cho cộng đồng.', section: 'community', visibility: 'unlisted', status: 'beta', indexable: false, tags: ['8D', 'RPG'] },
  { id: 'pet', path: '/petlandingpage', title: 'ChatDVT Pet System', description: 'Landing page thử nghiệm cho hệ thống pet của ChatDVT.', section: 'community', visibility: 'unlisted', status: 'beta', indexable: false, tags: ['ChatDVT', 'Pet'] },
  { id: 'hbd', path: '/hbd', title: 'Birthday Page', description: 'Trang chúc mừng riêng tư.', section: 'other', visibility: 'private', status: 'stable', indexable: false, tags: ['Private'] },
  { id: 'activity', path: '/activity', title: 'Discord Activity Hub', description: 'Điểm vào dành riêng cho Discord Activity.', section: 'community', visibility: 'private', status: 'beta', indexable: false, tags: ['Discord Activity'] },
  { id: 'pixel-activity', path: '/pixel-agents-activity', title: 'Pixel Agents Activity', description: 'Discord Activity nội bộ.', section: 'community', visibility: 'private', status: 'beta', indexable: false, tags: ['Discord Activity'] },
  { id: 'flappy-activity', path: '/flappy-bird-activity', title: 'Flappy Bird Activity', description: 'Discord Activity nội bộ.', section: 'community', visibility: 'private', status: 'beta', indexable: false, tags: ['Discord Activity'] },
  { id: 'survivor-activity', path: '/survivor-arena-activity', title: 'Survivor Arena Activity', description: 'Discord Activity nội bộ.', section: 'community', visibility: 'private', status: 'beta', indexable: false, tags: ['Discord Activity'] },
];

export function findFeatureByPath(pathname: string): FeatureDefinition | undefined {
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  return FEATURE_CATALOG.find((feature) => feature.path === normalized);
}

export function isFeatureIndexable(pathname: string): boolean | undefined {
  return findFeatureByPath(pathname)?.indexable;
}
