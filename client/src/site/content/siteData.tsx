import type { LucideIcon } from 'lucide-react';
import {
  BrainCircuit, Briefcase, Code2, Database, Eye, GitBranch, Link2, Palette,
  QrCode, ShieldCheck, Smartphone, StickyNote, Swords, TerminalSquare, Zap,
  BookOpen,
} from 'lucide-react';

export type ItemKind = 'game' | 'ai' | 'community' | 'mobile' | 'utility' | 'learning';

export interface SiteItem {
  id: string;
  title: string;
  description: string;
  href: string;
  kind: ItemKind;
  icon: LucideIcon;
  tags: string[];
  image?: string;
  featured?: boolean;
}

export const playgroundItems: SiteItem[] = [
  { id: 'survivor', title: 'Survivor Arena 8D', description: 'Auto-shooter roguelike gồm 50 đợt, boss và hệ thống nâng cấp kỹ năng.', href: '/survivor-arena', kind: 'game', icon: Swords, tags: ['Game', 'Roguelike'], featured: true },
  { id: 'quiz', title: 'Web Quiz AI', description: 'Tạo phòng quiz real-time, câu hỏi được AI sinh theo chủ đề.', href: '/quiz', kind: 'game', icon: BrainCircuit, tags: ['Real-time', 'AI'] },
  { id: 'chibi', title: 'Chibi Sticker AI', description: 'Biến ảnh thành bộ sticker với nhiều style và pose.', href: '/chibi-sticker', kind: 'ai', icon: Palette, tags: ['Image', 'AI'] },
];

export const utilityItems: SiteItem[] = [
  { id: 'android-toolbox', title: 'Android Device Toolbox', description: 'Kết nối Android qua USB để điều khiển app, test permission, chụp màn hình và lấy log.', href: '/android-toolbox', kind: 'mobile', icon: TerminalSquare, tags: ['Android', 'WebUSB', 'Debug'], featured: true },
  { id: 'deeplink', title: 'Deep Link Tester', description: 'Soạn và kiểm tra URI, tạo QR hoặc lệnh mở app trên iOS/Android.', href: '/deeplink-tester', kind: 'mobile', icon: Link2, tags: ['iOS', 'Android', 'Deep link'], featured: true },
  { id: 'webview', title: 'WebView Simulator', description: 'Dán HTML/JS để xem nhanh trong khung thiết bị mobile.', href: '/emulator-check', kind: 'mobile', icon: Smartphone, tags: ['WebView', 'Debug'] },
  { id: 'qr', title: 'QR Generator', description: 'Tạo mã QR có logo, màu riêng và tải xuống thành ảnh.', href: '/qr-generator', kind: 'mobile', icon: QrCode, tags: ['QR', 'Testing'] },
  { id: 'mermaid', title: 'Mermaid Editor', description: 'Soạn, preview, chỉnh style và export diagram.', href: '/mermaid-editor', kind: 'utility', icon: GitBranch, tags: ['Diagram', 'Docs'] },
  { id: 'cv', title: 'CV Reviewer', description: 'Đánh giá CV và hỗ trợ viết lại nội dung bằng AI.', href: '/cv-review', kind: 'utility', icon: Briefcase, tags: ['Career', 'AI'] },
  { id: 'duel', title: 'So Kèo Công Nghệ', description: 'So sánh hai công nghệ và tóm tắt ưu, nhược điểm.', href: '/tech-duel', kind: 'utility', icon: Swords, tags: ['Research', 'AI'] },
  { id: 'detox', title: 'Digital Detox', description: 'Theo dõi thử thách giảm sử dụng mạng xã hội trong 30 ngày.', href: '/digital-detox', kind: 'utility', icon: ShieldCheck, tags: ['Habit', 'Local data'] },
  { id: 'note', title: 'Note Daily', description: 'Ghi chú hằng ngày, calendar view và streak local-first.', href: '/note-daily', kind: 'utility', icon: StickyNote, tags: ['Notes', 'Local-first'] },
  { id: 'burnout', title: 'Burnout Check', description: 'Self-check ngắn kèm phân tích khi công việc quá tải.', href: '/burnout-check', kind: 'utility', icon: Zap, tags: ['Wellbeing', 'AI'] },
  { id: 'poe2', title: 'PoE2 Trade Link', description: 'Biến mô tả item thành query/link trade có cấu trúc.', href: '/poe2-trade-link', kind: 'utility', icon: Database, tags: ['Parser', 'PoE2'] },
  { id: 'english', title: 'English Learning Hub', description: 'Course map, flashcard, dictation, writing và AI conversation.', href: '/english', kind: 'learning', icon: BookOpen, tags: ['Learning', 'AI'], image: '/images/course-hero.jpg' },
  { id: 'rn-guide', title: 'React Native Guide', description: 'Roadmap thực chiến từ JS/TS đến architecture, testing và CI/CD.', href: '/rn-learning-guide/', kind: 'learning', icon: Code2, tags: ['React Native', 'Guide'], image: '/images/course-hero.jpg' },
  { id: 'pd-guide', title: 'Physical Design Guide', description: 'Tài liệu nền tảng từ floorplan đến timing closure và signoff.', href: '/pd-learning-guide/', kind: 'learning', icon: TerminalSquare, tags: ['VLSI', 'Guide'] },
  { id: 'cost', title: 'Cost-effectiveness Study', description: 'Nghiên cứu chi phí – hiệu quả trong điều trị phù hoàng điểm.', href: '/cost-study', kind: 'utility', icon: Eye, tags: ['Research', 'Healthcare'] },
];

export interface FeaturedProject {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  image?: string;
  kind?: 'discord' | 'arena';
  tags: string[];
}

export const featuredProjects: FeaturedProject[] = [
  { eyebrow: 'Discord Bot', title: 'ChatDVT', description: 'Discord bot gồm AI chat, hệ thống kinh tế, pet và mini game.', href: '/discord', kind: 'discord', tags: ['Discord.js', 'Gemini', 'Prisma'] },
  { eyebrow: 'Web game', title: 'Survivor Arena 8D', description: 'Auto-shooter roguelike với 50 đợt, boss và hệ thống nâng cấp kỹ năng.', href: '/survivor-arena', kind: 'arena', tags: ['Canvas', 'Game loop', 'Touch'] },
  { eyebrow: 'Tài liệu mobile', title: 'React Native Learning Guide', description: 'Tài liệu React Native từ nền tảng, kiến trúc, kiểm thử đến CI/CD.', href: '/rn-learning-guide/', image: '/images/course-hero.jpg', tags: ['React Native', 'Architecture', 'Notes'] },
];
