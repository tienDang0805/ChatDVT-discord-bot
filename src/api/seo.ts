import { Request, Response, Router } from 'express';
import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://devtiendang.blog';
const DEFAULT_OG_IMAGE = 'https://cdn.jsdelivr.net/gh/tienDang0805/ChatDVT-discord-bot@main/client/public/images/chibi-bear.jpg';

interface RouteMeta {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  priority?: number;
  changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

const ROUTE_META: Record<string, RouteMeta> = {
  '/': {
    title: 'ChatDVT Portal — 30+ AI Tools & Games Miễn Phí',
    description: 'Bộ sưu tập 30+ tính năng AI, Game, Tiện ích miễn phí. Thần số học, Tarot AI, CV Review, English Hub, Tu Tiên và nhiều hơn nữa.',
    keywords: 'chatdvt, ai tools, game, tiện ích, thần số học, tarot, cv review, english learning',
    priority: 1.0,
    changefreq: 'daily',
  },
  '/food-wheel': {
    title: 'Vòng Quay Phong Thủy Ẩm Thực — Hôm Nay Ăn Gì? | ChatDVT',
    description: 'AI đề xuất 5 món ăn hôm nay theo phong thủy hài hước. Gợi ý ăn gì mỗi ngày với lời khuyên phong thủy bá đạo.',
    keywords: 'ăn gì hôm nay, phong thủy ẩm thực, ai đề xuất món ăn, gợi ý món ăn',
    priority: 0.8,
    changefreq: 'daily',
  },
  '/excuse-generator': {
    title: 'Máy Tạo Lý Do Xin Nghỉ Phép AI | ChatDVT',
    description: 'AI tạo lý do xin nghỉ phép siêu hài hước, kèm email mẫu gửi sếp. Lý do nghỉ phép vô lý nhưng viết rất nghiêm túc.',
    keywords: 'lý do xin nghỉ phép, nghỉ phép hài hước, email nghỉ phép mẫu',
    priority: 0.7,
    changefreq: 'monthly',
  },
  '/handsome': {
    title: 'AI Phân Tích Nhan Sắc — Chấm Điểm Khuôn Mặt | ChatDVT',
    description: 'Upload ảnh để AI chấm điểm nhan sắc, phân tích chi tiết từng bộ phận khuôn mặt với nhận xét siêu bựa.',
    keywords: 'phân tích nhan sắc, chấm điểm đẹp trai, ai nhận xét ngoại hình, chấm điểm khuôn mặt',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/cv-review': {
    title: 'AI Review & Viết Lại CV Chuyên Nghiệp | ChatDVT',
    description: 'Upload CV để AI đánh giá chi tiết, chấm điểm ATS, và viết lại CV chuyên nghiệp. Hỗ trợ PDF, Word, ảnh.',
    keywords: 'review cv, đánh giá cv, viết cv, ats score, cv ai, cv chuyên nghiệp',
    priority: 0.9,
    changefreq: 'monthly',
  },
  '/music': {
    title: 'Music Station — Nghe Nhạc Online Miễn Phí | ChatDVT',
    description: 'Nghe nhạc online miễn phí, tạo playlist cá nhân với secret code riêng.',
    keywords: 'nghe nhạc online, playlist nhạc, music player miễn phí',
    priority: 0.6,
    changefreq: 'weekly',
  },
  '/pixel-agents': {
    title: 'Văn Phòng 8D Pixel — Chat AI Real-time | ChatDVT',
    description: 'Phòng chat pixel art real-time với 5 AI agents cá tính, chat bựa kiểu Gen Z Việt Nam.',
    keywords: 'pixel art chat, ai chat room, 8d office, chat ai vui',
    priority: 0.7,
    changefreq: 'monthly',
  },
  '/numerology': {
    title: 'Thần Số Học AI — Phân Tích Chi Tiết Pythagoras | ChatDVT',
    description: 'Phân tích thần số học chi tiết theo Pythagoras: Life Path, Expression, Soul Urge, Personality, và hơn 20 chỉ số khác.',
    keywords: 'thần số học, numerology, life path, pythagoras, phân tích con số chủ đạo',
    priority: 0.9,
    changefreq: 'monthly',
  },
  '/gender-quiz': {
    title: 'Quiz Tâm Lý AI — Trắc Nghiệm Phong Cách | ChatDVT',
    description: 'AI tạo quiz tâm lý cá nhân hóa, phân tích phong cách và tính cách qua câu hỏi trắc nghiệm.',
    keywords: 'quiz tâm lý, trắc nghiệm tính cách, phân tích tâm lý ai',
    priority: 0.7,
    changefreq: 'monthly',
  },
  '/astrology': {
    title: 'Chiêm Tinh AI — Phân Tích Cung Hoàng Đạo | ChatDVT',
    description: 'AI phân tích cung hoàng đạo chi tiết: tính cách, tình yêu, sự nghiệp, sức khỏe và dự đoán tương lai.',
    keywords: 'chiêm tinh, cung hoàng đạo, tử vi, zodiac, astrology ai',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/qr-generator': {
    title: 'Tạo QR Code Miễn Phí Online | ChatDVT',
    description: 'Tạo mã QR miễn phí cho URL, text, WiFi và nhiều loại dữ liệu khác. Đẹp, nhanh, không cần đăng ký.',
    keywords: 'tạo qr code, qr generator, mã qr miễn phí, qr code online',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/cost-study': {
    title: 'Tính Chi Phí Sinh Hoạt — Lập Kế Hoạch Tài Chính | ChatDVT',
    description: 'Công cụ tính toán chi phí sinh hoạt hàng tháng, lập kế hoạch tài chính cá nhân thông minh.',
    keywords: 'chi phí sinh hoạt, tính chi phí, lập kế hoạch tài chính, quản lý chi tiêu',
    priority: 0.7,
    changefreq: 'monthly',
  },
  '/tarot': {
    title: 'Bói Tarot AI — Rút Bài Tarot Online Miễn Phí | ChatDVT',
    description: 'AI rút và giải nghĩa bài Tarot, tư vấn tình yêu, sự nghiệp, tài chính. Chat trực tiếp với AI Tarot.',
    keywords: 'bói tarot, rút bài tarot online, tarot miễn phí, giải nghĩa tarot ai',
    priority: 0.9,
    changefreq: 'monthly',
  },
  '/magic-ball': {
    title: 'Cầu Pha Lê AI — Hỏi Đáp Huyền Bí | ChatDVT',
    description: 'Hỏi cầu pha lê AI bất cứ câu hỏi nào, nhận câu trả lời huyền bí và hài hước bất ngờ.',
    keywords: 'cầu pha lê, magic 8 ball, bói toán ai, hỏi đáp huyền bí',
    priority: 0.6,
    changefreq: 'monthly',
  },
  '/deep-status': {
    title: 'Tạo Status Sâu Sắc AI — Caption Hay Cho MXH | ChatDVT',
    description: 'AI viết status sâu sắc, caption thả thính, triết lý cho Facebook, Instagram, Zalo. Copy 1 click.',
    keywords: 'status sâu sắc, caption hay, thả thính, status facebook, caption instagram',
    priority: 0.7,
    changefreq: 'daily',
  },
  '/chicken-game': {
    title: 'Chicken Game — Mini Game Giải Trí | ChatDVT',
    description: 'Mini game gà con vui nhộn, giải trí nhẹ nhàng ngay trên trình duyệt.',
    keywords: 'chicken game, mini game, game vui, game online miễn phí',
    priority: 0.5,
    changefreq: 'yearly',
  },
  '/burnout-check': {
    title: 'Kiểm Tra Burnout AI — Đánh Giá Kiệt Sức | ChatDVT',
    description: 'AI đánh giá mức độ kiệt sức (burnout) của bạn qua bộ câu hỏi chuyên sâu, kèm lời khuyên cải thiện.',
    keywords: 'burnout check, kiểm tra kiệt sức, sức khỏe tinh thần, stress test',
    priority: 0.7,
    changefreq: 'monthly',
  },
  '/poem-generator': {
    title: 'AI Viết Thơ — Sáng Tác Thơ Theo Yêu Cầu | ChatDVT',
    description: 'AI sáng tác thơ theo chủ đề và phong cách bạn chọn. Thơ lục bát, thơ tự do, haiku và nhiều thể loại.',
    keywords: 'viết thơ ai, sáng tác thơ, thơ lục bát, poem generator, làm thơ online',
    priority: 0.7,
    changefreq: 'monthly',
  },
  '/chibi-sticker': {
    title: 'Tạo Sticker Chibi AI Từ Ảnh | ChatDVT',
    description: 'Upload ảnh để AI biến thành sticker chibi dễ thương. Tạo sticker cá nhân hóa miễn phí.',
    keywords: 'tạo sticker chibi, chibi ai, sticker từ ảnh, sticker dễ thương',
    priority: 0.7,
    changefreq: 'monthly',
  },
  '/face-reader': {
    title: 'Xem Tướng Khuôn Mặt AI — Nhân Tướng Học | ChatDVT',
    description: 'AI xem tướng khuôn mặt từ ảnh, phân tích nhân tướng học chi tiết. Chat follow-up với AI tướng số.',
    keywords: 'xem tướng, nhân tướng học, ai xem tướng, face reading, tướng mặt',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/dream-interpreter': {
    title: 'Giải Mộng AI — Luận Giấc Mơ Chi Tiết | ChatDVT',
    description: 'Kể giấc mơ của bạn, AI giải nghĩa chi tiết theo tâm lý học và văn hóa dân gian Việt Nam.',
    keywords: 'giải mộng, giải giấc mơ, dream interpretation, luận giấc mơ, mơ thấy gì',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/tech-duel': {
    title: 'Tech Duel — AI So Sánh Công Nghệ | ChatDVT',
    description: 'AI so sánh và tư vấn công nghệ, framework, ngôn ngữ lập trình. React vs Vue, Python vs Go, và nhiều hơn.',
    keywords: 'so sánh công nghệ, tech comparison, react vs vue, framework comparison',
    priority: 0.7,
    changefreq: 'monthly',
  },
  '/english': {
    title: 'English Hub — Học Tiếng Anh Miễn Phí Với AI | ChatDVT',
    description: 'Nền tảng học tiếng Anh miễn phí với AI: Chat, Flashcard, Challenge, Dictionary, Spelling Bee, Writing Lab.',
    keywords: 'học tiếng anh, english learning, ai english, học tiếng anh miễn phí, luyện tiếng anh',
    priority: 0.9,
    changefreq: 'weekly',
  },
  '/english/chat': {
    title: 'Chat Tiếng Anh Với AI | English Hub — ChatDVT',
    description: 'Luyện nói tiếng Anh với AI chatbot, sửa lỗi ngữ pháp real-time, cải thiện kỹ năng giao tiếp.',
    keywords: 'chat tiếng anh, luyện nói tiếng anh, ai english chat, practice english',
    priority: 0.8,
    changefreq: 'weekly',
  },
  '/english/flashcard': {
    title: 'Flashcard Từ Vựng Tiếng Anh | English Hub — ChatDVT',
    description: 'Học từ vựng tiếng Anh qua flashcard thông minh, AI tạo bộ từ vựng theo chủ đề.',
    keywords: 'flashcard tiếng anh, học từ vựng, vocabulary flashcard, từ vựng tiếng anh',
    priority: 0.7,
    changefreq: 'weekly',
  },
  '/english/challenge': {
    title: 'English Challenge — Thử Thách Tiếng Anh | ChatDVT',
    description: 'Thử thách tiếng Anh hàng ngày với AI, test trình độ qua các bài tập đa dạng.',
    keywords: 'english challenge, thử thách tiếng anh, bài tập tiếng anh, test trình độ',
    priority: 0.7,
    changefreq: 'daily',
  },
  '/english/dictionary': {
    title: 'Từ Điển AI Anh-Việt | English Hub — ChatDVT',
    description: 'Tra từ điển Anh-Việt thông minh với AI giải thích ngữ cảnh, ví dụ và cách dùng.',
    keywords: 'từ điển anh việt, ai dictionary, tra từ điển, english vietnamese dictionary',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/english/daily-puzzle': {
    title: 'Daily Puzzle — Câu Đố Tiếng Anh Mỗi Ngày | ChatDVT',
    description: 'Câu đố tiếng Anh mỗi ngày, rèn luyện tư duy ngôn ngữ và từ vựng.',
    keywords: 'daily puzzle, câu đố tiếng anh, english puzzle, word game',
    priority: 0.6,
    changefreq: 'daily',
  },
  '/english/word-sprint': {
    title: 'Word Sprint — Chạy Đua Từ Vựng | English Hub — ChatDVT',
    description: 'Chạy đua từ vựng tiếng Anh, test tốc độ nhận biết từ trong thời gian giới hạn.',
    keywords: 'word sprint, vocabulary game, english word game, tốc độ từ vựng',
    priority: 0.6,
    changefreq: 'monthly',
  },
  '/english/spelling-bee': {
    title: 'Spelling Bee — Thi Đánh Vần Tiếng Anh | ChatDVT',
    description: 'Thi đánh vần tiếng Anh kiểu Spelling Bee, luyện chính tả từ cơ bản đến nâng cao.',
    keywords: 'spelling bee, đánh vần tiếng anh, english spelling, luyện chính tả',
    priority: 0.6,
    changefreq: 'monthly',
  },
  '/english/course': {
    title: 'Khóa Học Tiếng Anh AI — Lộ Trình Từ A-Z | ChatDVT',
    description: 'Khóa học tiếng Anh có lộ trình với AI, từ cơ bản đến nâng cao, học miễn phí.',
    keywords: 'khóa học tiếng anh, english course, lộ trình học tiếng anh, học tiếng anh online',
    priority: 0.8,
    changefreq: 'weekly',
  },
  '/english/writing': {
    title: 'Writing Lab — Luyện Viết Tiếng Anh AI | ChatDVT',
    description: 'Luyện viết tiếng Anh với AI chấm và sửa bài chi tiết, cải thiện kỹ năng viết.',
    keywords: 'luyện viết tiếng anh, writing practice, english writing, ai chấm bài',
    priority: 0.7,
    changefreq: 'monthly',
  },
  '/english/dictation': {
    title: 'Dictation Lab — Luyện Nghe Chép Tiếng Anh | ChatDVT',
    description: 'Luyện nghe chép tiếng Anh, cải thiện kỹ năng listening và spelling đồng thời.',
    keywords: 'luyện nghe tiếng anh, dictation, english listening, nghe chép',
    priority: 0.7,
    changefreq: 'monthly',
  },
  '/english/scramble': {
    title: 'Sentence Scramble — Sắp Xếp Câu Tiếng Anh | ChatDVT',
    description: 'Sắp xếp lại câu tiếng Anh bị xáo trộn, rèn ngữ pháp qua trò chơi tương tác.',
    keywords: 'sentence scramble, sắp xếp câu, english grammar game, ngữ pháp tiếng anh',
    priority: 0.6,
    changefreq: 'monthly',
  },
  '/english/word-match': {
    title: 'Word Match — Nối Từ Tiếng Anh | English Hub — ChatDVT',
    description: 'Nối từ tiếng Anh với nghĩa tương ứng, luyện từ vựng qua trò chơi nối từ.',
    keywords: 'word match, nối từ tiếng anh, vocabulary game, matching game',
    priority: 0.6,
    changefreq: 'monthly',
  },
  '/english/idiom-quest': {
    title: 'Idiom Quest — Khám Phá Thành Ngữ Tiếng Anh | ChatDVT',
    description: 'Khám phá và học thành ngữ tiếng Anh qua trò chơi tương tác, AI giải nghĩa.',
    keywords: 'idiom quest, thành ngữ tiếng anh, english idioms, learn idioms',
    priority: 0.6,
    changefreq: 'monthly',
  },
  '/english/context-clues': {
    title: 'Context Clues — Đoán Nghĩa Từ Qua Ngữ Cảnh | ChatDVT',
    description: 'Luyện kỹ năng đoán nghĩa từ qua ngữ cảnh, reading comprehension nâng cao.',
    keywords: 'context clues, đoán nghĩa, reading comprehension, suy luận ngữ cảnh',
    priority: 0.6,
    changefreq: 'monthly',
  },
  '/petlandingpage': {
    title: 'Gene-Sys Pet RPG — Hệ Thống Sinh Vật Huyền Bí | ChatDVT',
    description: 'Hệ thống Pet RPG trên Discord với AI: ấp trứng, chiến đấu PvP, tiến hóa, viễn chinh và nhiều hơn.',
    keywords: 'pet rpg, discord game, sinh vật huyền bí, gene-sys, discord bot game',
    priority: 0.7,
    changefreq: 'monthly',
  },
  '/tutien': {
    title: 'Tu Tiên Game — Idle RPG Kiếm Hiệp | ChatDVT',
    description: 'Game tu tiên idle RPG, tu luyện đột phá cảnh giới, vượt ải kiếm hiệp trên web.',
    keywords: 'tu tiên game, idle rpg, kiếm hiệp, tu luyện, game online miễn phí',
    priority: 0.7,
    changefreq: 'monthly',
  },
  '/quiz': {
    title: 'Web Quiz — Chơi Quiz Online Cùng Bạn Bè | ChatDVT',
    description: 'Tạo phòng quiz online, mời bạn bè vào chơi real-time. AI tạo câu hỏi đa chủ đề.',
    keywords: 'quiz online, chơi quiz, trivia game, quiz cùng bạn bè',
    priority: 0.7,
    changefreq: 'monthly',
  },
  '/mermaid-editor': {
    title: 'Mermaid Diagram Editor Online | ChatDVT',
    description: 'Editor trực tuyến cho Mermaid diagram: vẽ flowchart, sequence diagram, mindmap, class diagram.',
    keywords: 'mermaid editor, flowchart online, diagram editor, mermaid.js, vẽ sơ đồ',
    priority: 0.7,
    changefreq: 'monthly',
  },
  '/mermaid-tutorial': {
    title: 'Hướng Dẫn Mermaid Diagram Từ A-Z | ChatDVT',
    description: 'Tutorial chi tiết cách viết Mermaid diagram: flowchart, sequence, class diagram, ER diagram.',
    keywords: 'mermaid tutorial, hướng dẫn mermaid, flowchart tutorial, mermaid syntax',
    priority: 0.6,
    changefreq: 'monthly',
  },
  '/digital-detox': {
    title: 'Digital Detox 30 Ngày — Cai Nghiện Mạng Xã Hội | ChatDVT',
    description: 'Thử thách cai nghiện MXH 30 ngày, theo dõi tiến trình hàng ngày, AI phân tích và động viên bạn.',
    keywords: 'digital detox, cai nghiện mxh, detox mạng xã hội, 30 ngày không mxh',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/poe2-trade-link': {
    title: 'PoE 2 Trade Link Generator | ChatDVT',
    description: 'Tạo link trade Path of Exile 2 nhanh chóng với AI hỗ trợ tìm kiếm item.',
    keywords: 'poe2 trade, path of exile 2, trade link generator, poe2 items',
    priority: 0.5,
    changefreq: 'monthly',
  },
  '/note-daily': {
    title: 'Note Daily — Ghi Chú Hàng Ngày Đơn Giản | ChatDVT',
    description: 'Ứng dụng ghi chú hàng ngày đơn giản, lưu trữ local, không cần đăng ký tài khoản.',
    keywords: 'ghi chú, note daily, daily notes, ghi chú online',
    priority: 0.5,
    changefreq: 'monthly',
  },
  '/love8d': {
    title: 'Love 8D — Tình Yêu Văn Phòng 8D | ChatDVT',
    description: 'Trang kỷ niệm tình yêu và câu chuyện của nhóm 8D.',
    keywords: 'love 8d, tình yêu',
    priority: 0.3,
    changefreq: 'yearly',
  },
  '/profile': {
    title: 'Hồ Sơ Cá Nhân | ChatDVT',
    description: 'Xem thông tin cá nhân, thành tích và lịch sử hoạt động trên ChatDVT.',
    keywords: 'profile, hồ sơ cá nhân, chatdvt profile',
    priority: 0.4,
    changefreq: 'monthly',
  },
  '/emulator-check': {
    title: 'Emulator Check — Phát Hiện Giả Lập | ChatDVT',
    description: 'Kiểm tra thiết bị đang dùng có phải giả lập (emulator) hay không.',
    keywords: 'emulator check, phát hiện giả lập, emulator detection',
    priority: 0.4,
    changefreq: 'yearly',
  },
};

export function getRouteMeta(pathname: string): RouteMeta | null {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];

  const dynamicMatch = Object.keys(ROUTE_META).find(
    (pattern) => pathname.startsWith(pattern + '/')
  );
  return dynamicMatch ? ROUTE_META[dynamicMatch] : null;
}

export function generateSitemapXml(): string {
  const today = new Date().toISOString().split('T')[0];
  const urls = Object.entries(ROUTE_META)
    .map(([path, meta]) => {
      return `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${meta.changefreq || 'monthly'}</changefreq>
    <priority>${meta.priority ?? 0.5}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function injectSeoMeta(html: string, pathname: string): string {
  const meta = getRouteMeta(pathname);
  if (!meta) return html;

  const safeTitle = escapeHtml(meta.title);
  const safeDesc = escapeHtml(meta.description);
  const canonicalUrl = `${SITE_URL}${pathname}`;
  const ogImage = meta.image || DEFAULT_OG_IMAGE;

  let result = html;

  result = result.replace(
    /<title>[^<]*<\/title>/,
    `<title>${safeTitle}</title>`
  );

  result = result.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${safeDesc}"`
  );

  result = result.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${safeTitle}"`
  );

  result = result.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${safeDesc}"`
  );

  result = result.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${canonicalUrl}"`
  );

  result = result.replace(
    /<meta property="og:image" content="[^"]*"/,
    `<meta property="og:image" content="${ogImage}"`
  );

  result = result.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${safeTitle}"`
  );

  result = result.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${safeDesc}"`
  );

  result = result.replace(
    /<meta property="twitter:url" content="[^"]*"/,
    `<meta property="twitter:url" content="${canonicalUrl}"`
  );

  result = result.replace(
    /<meta name="twitter:image" content="[^"]*"/,
    `<meta name="twitter:image" content="${ogImage}"`
  );

  const keywordsMeta = meta.keywords
    ? `<meta name="keywords" content="${escapeHtml(meta.keywords)}">`
    : '';

  const canonicalLink = `<link rel="canonical" href="${canonicalUrl}">`;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: meta.title,
    description: meta.description,
    url: canonicalUrl,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'VND' },
    author: {
      '@type': 'Person',
      name: 'Tiến Đặng',
      url: 'https://devtiendang.blog',
    },
  });

  const injectedTags = `${canonicalLink}\n    ${keywordsMeta}\n    <script type="application/ld+json">${jsonLd}</script>`;

  result = result.replace('</head>', `    ${injectedTags}\n  </head>`);

  return result;
}

export function createSeoRoutes(): Router {
  const router = Router();

  router.get('/sitemap.xml', (_req: Request, res: Response) => {
    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(generateSitemapXml());
  });

  return router;
}

export function createSeoFallbackHandler(clientBuildPath: string) {
  const indexHtmlPath = path.join(clientBuildPath, 'index.html');

  let indexHtmlTemplate = '';
  try {
    indexHtmlTemplate = fs.readFileSync(indexHtmlPath, 'utf-8');
  } catch {
    console.warn('[SEO] index.html not found at build path, meta injection disabled.');
  }

  return (req: Request, res: Response) => {
    if (!indexHtmlTemplate) {
      return res.sendFile(indexHtmlPath);
    }

    const injectedHtml = injectSeoMeta(indexHtmlTemplate, req.path);
    res.set('Content-Type', 'text/html');
    res.send(injectedHtml);
  };
}
