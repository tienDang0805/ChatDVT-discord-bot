import { createContext } from 'react';

export interface CollectedPageMeta {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  schemaName?: string;
  pageType?: 'website' | 'profile' | 'collection' | 'software' | 'blog' | 'article' | 'webapp';
  ogType?: 'website' | 'article';
  indexable?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}

// A fresh collector per server render; no global metadata or language state.
export const PageMetaCollector = createContext<((meta: CollectedPageMeta) => void) | null>(null);
