export type BlogPostStatus = 'draft' | 'published';

export type BlogCategoryId = 'story' | 'mobile' | 'ai' | 'side-project';

export interface BlogCategoryMeta {
  id: BlogCategoryId;
  label: { vi: string; en: string };
  shortBadge: { vi: string; en: string };
  description: { vi: string; en: string };
}

export const BLOG_CATEGORIES: readonly BlogCategoryMeta[] = [
  {
    id: 'story',
    label: { vi: 'Kể chuyện', en: 'Stories' },
    shortBadge: { vi: 'KỂ CHUYỆN', en: 'STORIES' },
    description: {
      vi: 'Chuyện hậu trường đi làm, chuyện nhóm 8D và những lần mày mò ngoài giờ.',
      en: 'Behind-the-scenes stories from work, the 8D group and after-hours tinkering.',
    },
  },
  {
    id: 'mobile',
    label: { vi: 'Mobile', en: 'Mobile' },
    shortBadge: { vi: 'MOBILE DEV', en: 'MOBILE DEV' },
    description: {
      vi: 'Ghi chép thực chiến với React Native, Android/Kotlin, SDK và tối ưu hiệu năng app.',
      en: 'Hands-on notes on React Native, Android/Kotlin, native SDKs and mobile performance.',
    },
  },
  {
    id: 'ai',
    label: { vi: 'AI', en: 'AI' },
    shortBadge: { vi: 'AI · AGENT', en: 'AI · AGENT' },
    description: {
      vi: 'Kiến trúc AI Agent, Code Harness, MCP và thực chiến ghép các mô hình LLM.',
      en: 'AI Agents, Code Harnesses, MCP and practical LLM workflows.',
    },
  },
  {
    id: 'side-project',
    label: { vi: 'Side Project', en: 'Side Project' },
    shortBadge: { vi: 'SIDE PROJECT', en: 'SIDE PROJECT' },
    description: {
      vi: 'Quá trình tự dựng bot Discord, ứng dụng Windows, web game và đồ nghề cá nhân.',
      en: 'Building Discord bots, Windows apps, web games and personal developer tools.',
    },
  },
] as const;

export const BLOG_CATEGORY_IDS: readonly BlogCategoryId[] = [
  'story',
  'mobile',
  'ai',
  'side-project',
];

export function isBlogCategoryId(value: unknown): value is BlogCategoryId {
  return typeof value === 'string' && (BLOG_CATEGORY_IDS as readonly string[]).includes(value);
}

export function inferBlogCategory(input: {
  slug?: string;
  title?: string;
  category?: string | null;
}): BlogCategoryId {
  const raw = typeof input.category === 'string' ? input.category.trim().toLowerCase() : '';
  if (isBlogCategoryId(raw)) return raw;
  const text = `${input.slug || ''} ${input.title || ''}`.toLowerCase();
  if (/(ai-agent|code-harness|mcp|gemini|codex|llm|gpt|prompt-cache)/i.test(text)) {
    return 'ai';
  }
  if (/(react-native|android|kotlin|ios|webview|deeplink)/i.test(text) && input.slug !== 'chatdvt-phan-1') {
    return 'mobile';
  }
  if (/(wallpaper|windows|game|tool|side-project)/i.test(text) && input.slug !== 'chatdvt-phan-1') {
    return 'side-project';
  }
  return 'story';
}

export function getBlogCategoryMeta(category?: string | null, fallbackInput?: { slug?: string; title?: string }): BlogCategoryMeta {
  const resolved = isBlogCategoryId(category)
    ? category
    : inferBlogCategory({ ...fallbackInput, category });
  return BLOG_CATEGORIES.find((item) => item.id === resolved) || BLOG_CATEGORIES[0];
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category?: BlogCategoryId;
  excerpt: string;
  content: string;
  status: BlogPostStatus;
  readingMinutes: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BlogPostSummary = Omit<BlogPost, 'content'>;

export type BlogPostInput = Pick<
  BlogPost,
  'title' | 'slug' | 'category' | 'excerpt' | 'content' | 'status' | 'readingMinutes'
>;
