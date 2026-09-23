export type BlogPostStatus = 'draft' | 'published';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
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
  'title' | 'slug' | 'excerpt' | 'content' | 'status' | 'readingMinutes'
>;
