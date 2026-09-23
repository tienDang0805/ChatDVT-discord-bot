import { Router } from 'express';
import { prisma } from '../../database/prisma';

const router = Router();

const ALLOWED_TAGS = new Set([
  'p', 'div', 'span', 'h2', 'h3', 'blockquote', 'pre', 'code',
  'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a', 'br',
  'figure', 'figcaption', 'img',
]);

function normalizeSlug(value: unknown): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function readAttribute(source: string, name: string): string {
  const match = source.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match?.[1] || match?.[2] || match?.[3] || '';
}

function sanitizeBlogHtml(value: unknown): string {
  const html = String(value || '')
    .replace(/<!--([\s\S]*?)-->/g, '')
    .replace(/<(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|style|iframe|object|embed|form)[^>]*\/?>/gi, '');

  return html.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (full, rawTag: string, attrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return '';
    if (full.startsWith('</')) return `</${tag}>`;
    if (tag === 'br') return '<br>';

    if (tag === 'a') {
      const href = readAttribute(attrs, 'href').trim();
      const safeHref = /^(https?:\/\/|mailto:|\/|#)/i.test(href) ? href : '#';
      return `<a href="${escapeAttribute(safeHref)}" target="_blank" rel="noopener noreferrer">`;
    }

    if (tag === 'img') {
      const src = readAttribute(attrs, 'src').trim();
      const alt = readAttribute(attrs, 'alt').trim().slice(0, 240);
      const safeSource = /^(https?:\/\/|\/)/i.test(src)
        || /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(src);
      return safeSource
        ? `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}">`
        : '';
    }

    return `<${tag}>`;
  });
}

function plainTextFromHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function validatePayload(body: any) {
  const title = String(body.title || '').trim().slice(0, 180);
  const slug = normalizeSlug(body.slug || title);
  const excerpt = String(body.excerpt || '').trim().slice(0, 420);
  const content = sanitizeBlogHtml(body.content);
  const status = body.status === 'published' ? 'published' : 'draft';
  const wordCount = plainTextFromHtml(content).split(/\s+/).filter(Boolean).length;
  const requestedMinutes = Number(body.readingMinutes);
  const readingMinutes = Number.isFinite(requestedMinutes) && requestedMinutes > 0
    ? Math.min(99, Math.round(requestedMinutes))
    : Math.max(1, Math.ceil(wordCount / 230));

  if (!title || !slug || !excerpt || !plainTextFromHtml(content)) {
    return { error: 'Tiêu đề, đường dẫn, mô tả và nội dung đều bắt buộc.' } as const;
  }

  if (content.length > 12_000_000) {
    return { error: 'Nội dung bài viết vượt quá 12 MB. Hãy dùng ảnh nhỏ hơn.' } as const;
  }

  return { data: { title, slug, excerpt, content, status, readingMinutes } } as const;
}

router.get('/blog/posts', async (_req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true,
        readingMinutes: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(posts);
  } catch (error) {
    console.error('[Blog] Failed to list published posts:', error);
    res.status(500).json({ error: 'Không thể tải danh sách bài viết.' });
  }
});

router.get('/blog/posts/:slug', async (req, res) => {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug: normalizeSlug(req.params.slug), status: 'published' },
    });
    if (!post) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    res.json(post);
  } catch (error) {
    console.error('[Blog] Failed to load published post:', error);
    res.status(500).json({ error: 'Không thể tải bài viết.' });
  }
});

router.get('/admin/blog-posts', async (_req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    res.json(posts);
  } catch (error) {
    console.error('[Blog Admin] Failed to list posts:', error);
    res.status(500).json({ error: 'Không thể tải danh sách bài viết.' });
  }
});

router.post('/admin/blog-posts', async (req, res) => {
  try {
    const payload = validatePayload(req.body);
    if ('error' in payload) return res.status(400).json({ error: payload.error });

    const post = await prisma.blogPost.create({
      data: {
        ...payload.data,
        publishedAt: payload.data.status === 'published' ? new Date() : null,
      },
    });
    res.status(201).json(post);
  } catch (error: any) {
    console.error('[Blog Admin] Failed to create post:', error);
    if (error?.code === 'P2002') return res.status(409).json({ error: 'Đường dẫn bài viết đã tồn tại.' });
    res.status(500).json({ error: 'Không thể tạo bài viết.' });
  }
});

router.put('/admin/blog-posts/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'ID bài viết không hợp lệ.' });

    const payload = validatePayload(req.body);
    if ('error' in payload) return res.status(400).json({ error: payload.error });

    const current = await prisma.blogPost.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...payload.data,
        publishedAt: payload.data.status === 'published'
          ? current.publishedAt || new Date()
          : null,
      },
    });
    res.json(post);
  } catch (error: any) {
    console.error('[Blog Admin] Failed to update post:', error);
    if (error?.code === 'P2002') return res.status(409).json({ error: 'Đường dẫn bài viết đã tồn tại.' });
    res.status(500).json({ error: 'Không thể cập nhật bài viết.' });
  }
});

router.delete('/admin/blog-posts/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'ID bài viết không hợp lệ.' });
    await prisma.blogPost.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    console.error('[Blog Admin] Failed to delete post:', error);
    if (error?.code === 'P2025') return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    res.status(500).json({ error: 'Không thể xoá bài viết.' });
  }
});

export default router;
