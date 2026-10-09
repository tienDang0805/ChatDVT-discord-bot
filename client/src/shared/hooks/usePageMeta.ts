import { PageMetaCollector } from '../contexts/PageMetaCollector';
import { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isFeatureIndexable } from '../../../../src/shared/featureCatalog';
import { AUTHOR_SCHEMA as AUTHOR, CHATDVT_ENTITY_ID, CHATDVT_FEATURES, CHATDVT_SOURCE_URL } from '../../../../src/shared/siteIdentity';
import { WALLPAPER_APP, wallpaperSoftwareProperties } from '../../../../src/shared/desktopApps';
import { CHATDVT_HISTORY_PATH, CHATDVT_ARTICLE_SUBJECT } from '../../../../src/shared/chatdvt';
import { useLanguage } from '../i18n/LanguageContext';
import { stripLocalePrefix } from '../i18n';

const SITE_URL = 'https://devtiendang.blog';
const SITE_NAME = 'Đặng Văn Tiến';
const SITE_ALTERNATE_NAMES = ['Tiến Đặng', 'Tien Dang', 'devtiendang.blog'];
const DEFAULT_DESCRIPTION = 'Đặng Văn Tiến là Mobile Developer chuyên React Native và Android/Kotlin tại TP.HCM, người phát triển devtiendang.blog và AI chatbot ChatDVT.';
const DEFAULT_IMAGE = `${SITE_URL}/site-og.png`;
const INDEXABLE_PATHS = new Set([
  '/', '/ecosystem', '/playground', '/apps', WALLPAPER_APP.path, '/me', '/blog', '/mermaid-tutorial',
]);
const INDEXABLE_PREFIXES = ['/blog/', '/english/'];
const LOCALIZED_PATHS = new Set(['/', '/ecosystem', '/playground', '/apps', WALLPAPER_APP.path, '/mobile', '/discord', '/chat', '/me']);


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

function setAlternate(hreflang: string, href: string): void {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${hreflang}"]`);
  if (!link) {
    link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = hreflang;
    document.head.appendChild(link);
  }
  link.href = href;
}

function clearAlternates(): void {
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => link.remove());
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
  const normalizedPath = stripLocalePrefix(pathname === '/' ? '/' : pathname.replace(/\/+$/, ''));
  const featureIndexability = isFeatureIndexable(normalizedPath);
  if (featureIndexability !== undefined) return featureIndexability;
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
  schemaName?: string;
  noIndex?: boolean;
  publishedTime?: string | null;
  modifiedTime?: string | null;
}

function documentTitle(title: string): string {
  const normalizedTitle = title
    .replace(/^Tiến Đặng\s*—/, `${SITE_NAME} —`)
    .replace(/\s*\|\s*(ChatDVT|Tiến Đặng|devtiendang\.blog)$/i, ` | ${SITE_NAME}`)
    .replace(/\s*—\s*(ChatDVT|Tiến Đặng)$/i, ` | ${SITE_NAME}`);
  const fullTitle = /Đặng Văn Tiến/i.test(normalizedTitle) ? normalizedTitle : `${normalizedTitle} | ${SITE_NAME}`;
  return fullTitle;
}

export const usePageMeta = (title: string, options?: string | PageMetaOptions) => {
  const { locale } = useLanguage();
  const { pathname } = useLocation();
  const desc = typeof options === 'string' ? options : options?.description;
  const keywords = typeof options === 'object' ? options?.keywords : undefined;
  const image = typeof options === 'object' ? options?.image : undefined;
  const imageAlt = typeof options === 'object' ? options?.imageAlt : undefined;
  const type = typeof options === 'object' ? options?.type : undefined;
  const schema = typeof options === 'object' ? options?.schema : undefined;
  const schemaName = typeof options === 'object' ? options?.schemaName : undefined;
  const noIndex = typeof options === 'object' ? options?.noIndex : undefined;
  const publishedTime = typeof options === 'object' ? options?.publishedTime : undefined;
  const modifiedTime = typeof options === 'object' ? options?.modifiedTime : undefined;

  const collectMeta = useContext(PageMetaCollector);
  if (collectMeta) {
    const basePath = stripLocalePrefix(pathname);
    collectMeta({
      title: documentTitle(title), description: desc || DEFAULT_DESCRIPTION,
      keywords, image: resolveImageUrl(image), imageAlt, schemaName,
      pageType: schema || 'webapp', ogType: type || (schema === 'article' ? 'article' : 'website'),
      indexable: !(locale === 'en' && (basePath === '/blog' || basePath.startsWith('/blog/'))) && !(noIndex ?? !isIndexablePath(pathname)),
      publishedTime: publishedTime || undefined, modifiedTime: modifiedTime || undefined,
    });
  }

  useEffect(() => {
    const prev = document.title;
    const fullTitle = documentTitle(title);
    const resolvedDescription = desc || DEFAULT_DESCRIPTION;
    const resolvedImage = resolveImageUrl(image);
    const resolvedImageAlt = imageAlt || `${fullTitle} — devtiendang.blog`;
    const resolvedType = type || (schema === 'article' ? 'article' : 'website');
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    const basePath = stripLocalePrefix(normalizedPath);
    const isEnglishBlog = locale === 'en' && (basePath === '/blog' || basePath.startsWith('/blog/'));
    // The English blog shell still contains the original Vietnamese articles.
    // A page-level noIndex:false must not accidentally index that duplicate.
    const shouldNoIndex = isEnglishBlog || (noIndex ?? !isIndexablePath(pathname));
    document.title = fullTitle;

    const canonicalUrl = `${SITE_URL}${isEnglishBlog ? basePath : normalizedPath}`;
    setCanonical(canonicalUrl);
    const supportsLocale = LOCALIZED_PATHS.has(basePath);
    if (supportsLocale) {
      setAlternate('vi', `${SITE_URL}${basePath}`);
      setAlternate('en', `${SITE_URL}${basePath === '/' ? '/en' : `/en${basePath}`}`);
      setAlternate('x-default', `${SITE_URL}${basePath}`);
    } else {
      clearAlternates();
    }

    setMetaTag('description', resolvedDescription, true);
    setMetaTag('robots', shouldNoIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large', true);
    setMetaTag('og:title', fullTitle);
    setMetaTag('og:description', resolvedDescription);
    setMetaTag('og:url', canonicalUrl);
    setMetaTag('og:type', resolvedType);
    setMetaTag('og:site_name', SITE_NAME);
    setMetaTag('og:locale', locale === 'en' ? 'en_US' : 'vi_VN');
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
      '@id': `${canonicalUrl}#page`,
      name: fullTitle,
      description: resolvedDescription,
      url: canonicalUrl,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      inLanguage: isEnglishBlog ? 'vi-VN' : locale === 'en' ? 'en-US' : 'vi-VN',
    };
    const structuredData = pageSchema === 'profile'
      ? { ...base, '@type': 'ProfilePage', mainEntity: AUTHOR }
      : pageSchema === 'website'
        ? {
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: SITE_NAME, alternateName: SITE_ALTERNATE_NAMES, description: resolvedDescription, inLanguage: locale === 'en' ? 'en-US' : 'vi-VN', publisher: { '@id': AUTHOR['@id'] } },
            AUTHOR,
          ],
        }
        : pageSchema === 'collection'
          ? { ...base, '@type': 'CollectionPage', author: AUTHOR }
          : pageSchema === 'software'
          ? {
            ...base,
            '@type': 'SoftwareApplication',
            '@id': schemaName === 'ChatDVT' ? CHATDVT_ENTITY_ID : base['@id'],
            name: schemaName || fullTitle,
            alternateName: schemaName === 'ChatDVT' ? ['Chat DVT', 'ChatDVT Discord Bot'] : undefined,
            sameAs: schemaName === 'ChatDVT' ? [CHATDVT_SOURCE_URL] : undefined,
            applicationCategory: schemaName === 'ChatDVT' ? 'CommunicationApplication' : 'UtilitiesApplication',
            operatingSystem: schemaName === 'ChatDVT' ? 'Web, Discord' : 'All',
            image: resolvedImage,
            isAccessibleForFree: true,
            featureList: schemaName === 'ChatDVT'
              ? CHATDVT_FEATURES[locale]
              : undefined,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'VND' },
            creator: AUTHOR,
            ...(schemaName === WALLPAPER_APP.name ? wallpaperSoftwareProperties(locale) : {}),
          }
            : pageSchema === 'blog'
              ? { ...base, '@type': 'Blog', author: AUTHOR, publisher: AUTHOR }
              : pageSchema === 'article'
                ? { ...base, '@type': 'BlogPosting', headline: fullTitle, image: resolvedImage, datePublished: publishedTime || undefined, dateModified: modifiedTime || publishedTime || undefined, mainEntityOfPage: canonicalUrl, author: AUTHOR, publisher: AUTHOR, ...(basePath === CHATDVT_HISTORY_PATH ? { about: CHATDVT_ARTICLE_SUBJECT } : {}) }
                : { ...base, '@type': 'WebApplication', name: schemaName || fullTitle, applicationCategory: schemaName === 'ChatDVT Chat' ? 'CommunicationApplication' : 'UtilitiesApplication', operatingSystem: 'All', offers: { '@type': 'Offer', price: '0', priceCurrency: 'VND' }, author: AUTHOR };

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
  }, [title, desc, keywords, image, imageAlt, type, schema, schemaName, noIndex, publishedTime, modifiedTime, locale, pathname]);
};
