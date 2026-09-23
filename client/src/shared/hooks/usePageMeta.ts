import { useEffect } from 'react';

const SITE_URL = 'https://devtiendang.blog';
const SITE_NAME = 'Tiến Đặng';
const DEFAULT_DESCRIPTION = 'Portfolio của Đặng Văn Tiến, dev mobile React Native và Android/Kotlin. Dự án cá nhân, mobile utility, ChatDVT và những ghi chép lúc làm sản phẩm.';
const DEFAULT_IMAGE = `${SITE_URL}/site-og.png`;
const INDEXABLE_PATHS = new Set([
  '/', '/playground', '/mobile', '/discord', '/me', '/blog',
  '/survivor-arena', '/quiz', '/chibi-sticker', '/mermaid-editor',
  '/mermaid-tutorial', '/cv-review', '/english', '/deeplink-tester',
  '/emulator-check', '/qr-generator',
]);
const INDEXABLE_PREFIXES = ['/blog/', '/english/'];

const AUTHOR = {
  '@type': 'Person',
  '@id': `${SITE_URL}/me#person`,
  name: 'Đặng Văn Tiến',
  alternateName: ['Tiến Đặng', 'Dang Van Tien', 'devtiendang'],
  url: `${SITE_URL}/me`,
  jobTitle: 'Mobile Developer',
  sameAs: [
    'https://github.com/tienDang0805',
    'https://www.linkedin.com/in/%C4%91%E1%BA%B7ng-v%C4%83n-ti%E1%BA%BFn-41623529b/',
    'https://www.facebook.com/dvtien8599',
  ],
};

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

function removeMetaTag(property: string, isName = false): void {
  const selector = isName
    ? `meta[name="${property}"]`
    : `meta[property="${property}"]`;
  document.querySelector(selector)?.remove();
}

function resolveImageUrl(image?: string): string {
  if (!image) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(image)) return image;
  return `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`;
}

function isIndexablePath(pathname: string): boolean {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  return INDEXABLE_PATHS.has(normalizedPath)
    || INDEXABLE_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix));
}

type PageSchema = 'website' | 'profile' | 'collection' | 'software' | 'blog' | 'article' | 'webapp';

interface PageMetaOptions {
  description?: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  schema?: PageSchema;
  noIndex?: boolean;
  publishedTime?: string | null;
  modifiedTime?: string | null;
}

export const usePageMeta = (title: string, options?: string | PageMetaOptions) => {
  const desc = typeof options === 'string' ? options : options?.description;
  const keywords = typeof options === 'object' ? options?.keywords : undefined;
  const image = typeof options === 'object' ? options?.image : undefined;
  const imageAlt = typeof options === 'object' ? options?.imageAlt : undefined;
  const type = typeof options === 'object' ? options?.type : undefined;
  const schema = typeof options === 'object' ? options?.schema : undefined;
  const noIndex = typeof options === 'object' ? options?.noIndex : undefined;
  const publishedTime = typeof options === 'object' ? options?.publishedTime : undefined;
  const modifiedTime = typeof options === 'object' ? options?.modifiedTime : undefined;

  useEffect(() => {
    const prev = document.title;
    const fullTitle = /Tiến Đặng|Đặng Văn Tiến|devtiendang/i.test(title) ? title : `${title} | ${SITE_NAME}`;
    const resolvedDescription = desc || DEFAULT_DESCRIPTION;
    const resolvedImage = resolveImageUrl(image);
    const resolvedImageAlt = imageAlt || `${fullTitle} — devtiendang.blog`;
    const resolvedType = type || (schema === 'article' ? 'article' : 'website');
    const shouldNoIndex = noIndex ?? !isIndexablePath(window.location.pathname);
    document.title = fullTitle;

    const canonicalUrl = `${SITE_URL}${window.location.pathname}`;
    setCanonical(canonicalUrl);

    setMetaTag('description', resolvedDescription, true);
    setMetaTag('robots', shouldNoIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large', true);
    setMetaTag('og:title', fullTitle);
    setMetaTag('og:description', resolvedDescription);
    setMetaTag('og:url', canonicalUrl);
    setMetaTag('og:type', resolvedType);
    setMetaTag('og:site_name', SITE_NAME);
    setMetaTag('og:locale', 'vi_VN');
    setMetaTag('og:image', resolvedImage);
    setMetaTag('og:image:alt', resolvedImageAlt);
    setMetaTag('twitter:card', 'summary_large_image', true);
    setMetaTag('twitter:title', fullTitle, true);
    setMetaTag('twitter:description', resolvedDescription, true);
    setMetaTag('twitter:url', canonicalUrl, true);
    setMetaTag('twitter:image', resolvedImage, true);
    setMetaTag('twitter:image:alt', resolvedImageAlt, true);

    if (keywords) {
      setMetaTag('keywords', keywords, true);
    } else {
      removeMetaTag('keywords', true);
    }

    if (resolvedType === 'article' && publishedTime) {
      setMetaTag('article:published_time', publishedTime);
    } else {
      removeMetaTag('article:published_time');
    }
    if (resolvedType === 'article' && modifiedTime) {
      setMetaTag('article:modified_time', modifiedTime);
    } else {
      removeMetaTag('article:modified_time');
    }

    const pageSchema = schema || 'webapp';
    const base = {
      '@context': 'https://schema.org',
      name: fullTitle,
      description: resolvedDescription,
      url: canonicalUrl,
    };
    const structuredData = pageSchema === 'profile'
      ? { ...base, '@type': 'ProfilePage', mainEntity: AUTHOR }
      : pageSchema === 'website'
        ? { ...base, '@type': 'WebSite', author: AUTHOR }
        : pageSchema === 'collection'
          ? { ...base, '@type': 'CollectionPage', author: AUTHOR }
          : pageSchema === 'software'
            ? { ...base, '@type': 'SoftwareApplication', applicationCategory: 'EntertainmentApplication', operatingSystem: 'Discord', offers: { '@type': 'Offer', price: '0', priceCurrency: 'VND' }, author: AUTHOR }
            : pageSchema === 'blog'
              ? { ...base, '@type': 'Blog', author: AUTHOR }
              : pageSchema === 'article'
                ? { ...base, '@type': 'BlogPosting', headline: fullTitle, image: resolvedImage, datePublished: publishedTime || undefined, dateModified: modifiedTime || publishedTime || undefined, mainEntityOfPage: canonicalUrl, author: AUTHOR }
                : { ...base, '@type': 'WebApplication', applicationCategory: 'UtilitiesApplication', operatingSystem: 'All', offers: { '@type': 'Offer', price: '0', priceCurrency: 'VND' }, author: AUTHOR };

    let jsonLd = document.querySelector<HTMLScriptElement>('#page-structured-data');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.id = 'page-structured-data';
      jsonLd.type = 'application/ld+json';
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify(structuredData);

    return () => {
      document.title = prev;
    };
  }, [title, desc, keywords, image, imageAlt, type, schema, noIndex, publishedTime, modifiedTime]);
};
