import { createContext, useContext } from 'react';
import type { BlogPost, BlogPostSummary } from '../types/blog';

export interface PublicPageData {
  pathname: string;
  posts?: BlogPostSummary[];
  post?: BlogPost | null;
}

export const PublicPageDataContext = createContext<PublicPageData | null>(null);
export const usePublicPageData = () => useContext(PublicPageDataContext);
