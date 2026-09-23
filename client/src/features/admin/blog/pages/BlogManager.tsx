import { useCallback, useEffect, useRef, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import imageCompression from 'browser-image-compression';
import {
  Bold, Code2, ExternalLink, Heading2, ImagePlus, Italic, Link2,
  List, Loader2, Newspaper, Plus, Quote, Save, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createBlogPost,
  deleteBlogPost,
  getAdminBlogPosts,
  updateBlogPost,
} from '../../../../shared/api';
import { DEFAULT_BLOG_POST } from '../../../../shared/data/defaultBlogPost';
import type { BlogPost, BlogPostInput, BlogPostStatus } from '../../../../shared/types/blog';

const EMPTY_POST: BlogPostInput = {
  title: '',
  slug: '',
  excerpt: '',
  content: '<p>Bắt đầu viết ở đây...</p>',
  status: 'draft',
  readingMinutes: 1,
};

function toInput(post: BlogPost): BlogPostInput {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    status: post.status,
    readingMinutes: post.readingMinutes,
  };
}

function slugify(value: string): string {
  return value
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

export const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<BlogPostInput>(toInput(DEFAULT_BLOG_POST));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const editorRef = useRef<HTMLElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminBlogPosts();
      setPosts(data);
      if (data.length > 0) {
        setSelectedId(data[0].id);
        setDraft(toInput(data[0]));
      } else {
        setSelectedId(null);
        setDraft(toInput(DEFAULT_BLOG_POST));
      }
    } catch (error) {
      console.error(error);
      toast.error('Không tải được danh sách bài viết.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
    document.execCommand('defaultParagraphSeparator', false, 'p');
  }, [loadPosts]);

  const selectPost = (post: BlogPost) => {
    setSelectedId(post.id);
    setDraft(toInput(post));
    setSlugTouched(true);
  };

  const newPost = () => {
    setSelectedId(null);
    setDraft({ ...EMPTY_POST });
    setSlugTouched(false);
  };

  const updateTitle = (title: string) => {
    setDraft((current) => ({
      ...current,
      title,
      slug: !slugTouched ? slugify(title) : current.slug,
    }));
  };

  const save = async (status: BlogPostStatus = draft.status) => {
    const payload = { ...draft, status };
    setSaving(true);
    try {
      const saved = selectedId
        ? await updateBlogPost(selectedId, payload)
        : await createBlogPost(payload);
      setSelectedId(saved.id);
      setDraft(toInput(saved));
      setSlugTouched(true);
      setPosts((current) => [saved, ...current.filter((post) => post.id !== saved.id)]);
      toast.success(status === 'published' ? 'Đã publish bài viết.' : 'Đã lưu bản nháp.');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Không lưu được bài viết.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedId || !window.confirm('Xoá hẳn bài viết này? Hành động này không hoàn tác được.')) return;
    try {
      await deleteBlogPost(selectedId);
      const remaining = posts.filter((post) => post.id !== selectedId);
      setPosts(remaining);
      if (remaining[0]) selectPost(remaining[0]);
      else newPost();
      toast.success('Đã xoá bài viết.');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Không xoá được bài viết.');
    }
  };

  const rememberSelection = () => {
    const selection = window.getSelection();
    if (selection?.rangeCount) savedRangeRef.current = selection.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (!selection || !savedRangeRef.current) return;
    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
  };

  const runCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setDraft((current) => ({ ...current, content: editorRef.current?.innerHTML || current.content }));
    rememberSelection();
  };

  const addLink = () => {
    const url = window.prompt('Dán URL cần liên kết:');
    if (!url) return;
    runCommand('createLink', url);
  };

  const pickImage = () => {
    rememberSelection();
    imageInputRef.current?.click();
  };

  const addImage = async (file?: File) => {
    if (!file) return;
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: 'image/webp',
      });
      const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
      editorRef.current?.focus();
      restoreSelection();
      document.execCommand('insertImage', false, dataUrl);
      setDraft((current) => ({ ...current, content: editorRef.current?.innerHTML || current.content }));
      toast.success('Đã chèn ảnh.');
    } catch (error) {
      console.error(error);
      toast.error('Không xử lý được ảnh này.');
    } finally {
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const toolbarButton = 'inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-slate-600 transition hover:border-orange-400 hover:text-orange-600 dark:border-slate-700 dark:bg-[#171d26] dark:text-slate-300';

  if (loading) {
    return <div className="flex min-h-[420px] items-center justify-center text-slate-500"><Loader2 className="mr-2 animate-spin" /> Đang tải blog...</div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-500">Content</p>
          <h1 className="flex items-center gap-3 text-3xl font-black text-slate-900 dark:text-white"><Newspaper /> Blog</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Viết, lưu nháp và publish ngay tại đây. Không cần Markdown hay push Git.</p>
        </div>
        <button type="button" onClick={newPost} className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-orange-600 dark:bg-white dark:text-slate-900 dark:hover:bg-orange-500 dark:hover:text-white">
          <Plus size={17} /> Bài mới
        </button>
      </header>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-[#131923]">
          <p className="px-2 pb-3 pt-1 text-xs font-bold uppercase tracking-wider text-slate-400">Bài viết ({posts.length})</p>
          <div className="space-y-2">
            {posts.map((post) => (
              <button key={post.id} type="button" onClick={() => selectPost(post)} className={`w-full rounded-xl border p-3 text-left transition ${selectedId === post.id ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}>
                <span className={`mb-2 inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${post.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>{post.status === 'published' ? 'Đã đăng' : 'Bản nháp'}</span>
                <strong className="block text-sm leading-5 text-slate-800 dark:text-slate-100">{post.title}</strong>
                <small className="mt-1 block truncate text-slate-400">/{post.slug}</small>
              </button>
            ))}
            {posts.length === 0 && <p className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">Chưa có bài trong database. Bản Phần 1 hiện tại đã được nạp sẵn ở khung soạn bên cạnh.</p>}
          </div>
        </aside>

        <main className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#131923] sm:p-6">
          {selectedId === null && draft.slug === DEFAULT_BLOG_POST.slug && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              Đây là bài Phần 1 đang hiển thị ngoài trang public. Bấm <strong>Publish</strong> để đưa nó vào database; từ lần sau sửa trực tiếp tại đây.
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block lg:col-span-2">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Tiêu đề</span>
              <input value={draft.title} onChange={(event) => updateTitle(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-bold text-slate-900 outline-none transition focus:border-orange-500 dark:border-slate-700 dark:bg-[#0f141c] dark:text-white" placeholder="Tên bài viết" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Đường dẫn</span>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-orange-500 dark:border-slate-700 dark:bg-[#0f141c]">
                <span className="text-sm text-slate-400">/blog/</span>
                <input value={draft.slug} onChange={(event) => { setSlugTouched(true); setDraft((current) => ({ ...current, slug: slugify(event.target.value) })); }} className="min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-800 outline-none dark:text-slate-100" />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Thời gian đọc</span>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-orange-500 dark:border-slate-700 dark:bg-[#0f141c]">
                <input type="number" min={1} max={99} value={draft.readingMinutes} onChange={(event) => setDraft((current) => ({ ...current, readingMinutes: Math.max(1, Number(event.target.value) || 1) }))} className="min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-800 outline-none dark:text-slate-100" />
                <span className="text-sm text-slate-400">phút</span>
              </div>
            </label>
            <label className="block lg:col-span-2">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Mô tả ngắn</span>
              <textarea rows={3} maxLength={420} value={draft.excerpt} onChange={(event) => setDraft((current) => ({ ...current, excerpt: event.target.value }))} className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-orange-500 dark:border-slate-700 dark:bg-[#0f141c] dark:text-slate-100" placeholder="Đoạn này hiện ở trang danh sách và dùng cho SEO." />
            </label>
          </div>

          <div className="mt-6">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Nội dung</span>
            <div className="sticky top-3 z-10 mb-2 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50/95 p-2 backdrop-blur dark:border-slate-700 dark:bg-[#0f141c]/95">
              <button type="button" className={toolbarButton} title="Đoạn văn" onMouseDown={(event) => { event.preventDefault(); runCommand('formatBlock', '<p>'); }}>P</button>
              <button type="button" className={toolbarButton} title="Tiêu đề mục" onMouseDown={(event) => { event.preventDefault(); runCommand('formatBlock', '<h2>'); }}><Heading2 size={17} /></button>
              <button type="button" className={toolbarButton} title="In đậm" onMouseDown={(event) => { event.preventDefault(); runCommand('bold'); }}><Bold size={17} /></button>
              <button type="button" className={toolbarButton} title="In nghiêng" onMouseDown={(event) => { event.preventDefault(); runCommand('italic'); }}><Italic size={17} /></button>
              <button type="button" className={toolbarButton} title="Trích dẫn" onMouseDown={(event) => { event.preventDefault(); runCommand('formatBlock', '<blockquote>'); }}><Quote size={17} /></button>
              <button type="button" className={toolbarButton} title="Khối code" onMouseDown={(event) => { event.preventDefault(); runCommand('formatBlock', '<pre>'); }}><Code2 size={17} /></button>
              <button type="button" className={toolbarButton} title="Danh sách" onMouseDown={(event) => { event.preventDefault(); runCommand('insertUnorderedList'); }}><List size={17} /></button>
              <button type="button" className={toolbarButton} title="Chèn liên kết" onMouseDown={(event) => { event.preventDefault(); addLink(); }}><Link2 size={17} /></button>
              <button type="button" className={toolbarButton} title="Chèn ảnh từ máy" onMouseDown={(event) => { event.preventDefault(); pickImage(); }}><ImagePlus size={17} /></button>
              <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => addImage(event.target.files?.[0])} />
            </div>
            <ContentEditable
              innerRef={editorRef}
              html={draft.content}
              onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
              onKeyUp={rememberSelection}
              onMouseUp={rememberSelection}
              tagName="div"
              className="blog-admin-editor min-h-[560px] rounded-xl border border-slate-200 bg-white px-5 py-6 text-slate-800 outline-none transition focus:border-orange-500 dark:border-slate-700 dark:bg-[#0f141c] dark:text-slate-100 sm:px-8"
            />
          </div>

          <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
            <div className="flex items-center gap-2">
              {selectedId && <button type="button" onClick={remove} className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"><Trash2 size={16} /> Xoá</button>}
              {draft.status === 'published' && draft.slug && <a href={`/blog/${draft.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:border-orange-400 hover:text-orange-600 dark:border-slate-700 dark:text-slate-300"><ExternalLink size={16} /> Xem bài</a>}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" disabled={saving} onClick={() => save('draft')} className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-700 transition hover:border-orange-400 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"><Save size={16} /> Lưu nháp</button>
              <button type="button" disabled={saving} onClick={() => save('published')} className="inline-flex h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-50">{saving ? <Loader2 size={16} className="animate-spin" /> : <Newspaper size={16} />} Publish</button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default BlogManager;
