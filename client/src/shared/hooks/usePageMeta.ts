import { useEffect } from 'react';

export const usePageMeta = (title: string, description?: string) => {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} | ChatDVT`;

    let meta: Element | null = null;
    if (description) {
      meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }

    return () => {
      document.title = prev;
    };
  }, [title, description]);
};
