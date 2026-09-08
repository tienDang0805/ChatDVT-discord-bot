import { useEffect } from 'react';

const SITE_URL = 'https://devtiendang.blog';

function setMetaTag(property: string, content: string, isName = false): void {
  const selector = isName
    ? `meta[name="${property}"]`
    : `meta[property="${property}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(isName ? 'name' : 'property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url: string): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.href = url;
}

interface PageMetaOptions {
  description?: string;
  keywords?: string;
  image?: string;
}

export const usePageMeta = (title: string, options?: string | PageMetaOptions) => {
  const desc = typeof options === 'string' ? options : options?.description;
  const keywords = typeof options === 'object' ? options?.keywords : undefined;
  const image = typeof options === 'object' ? options?.image : undefined;

  useEffect(() => {
    const prev = document.title;
    document.title = `${title} | ChatDVT`;

    const canonicalUrl = `${SITE_URL}${window.location.pathname}`;
    setCanonical(canonicalUrl);

    setMetaTag('og:title', `${title} | ChatDVT`);
    setMetaTag('og:url', canonicalUrl);
    setMetaTag('twitter:title', `${title} | ChatDVT`, true);

    if (desc) {
      setMetaTag('description', desc, true);
      setMetaTag('og:description', desc);
      setMetaTag('twitter:description', desc, true);
    }

    if (keywords) {
      setMetaTag('keywords', keywords, true);
    }

    if (image) {
      setMetaTag('og:image', image);
      setMetaTag('twitter:image', image, true);
    }

    return () => {
      document.title = prev;
    };
  }, [title, desc, keywords, image]);
};
