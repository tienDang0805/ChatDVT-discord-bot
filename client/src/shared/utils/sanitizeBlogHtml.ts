import sanitizeHtml from 'sanitize-html';

// Use one parser and policy on the server and browser, including decoded URLs.
export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'div', 'span', 'h2', 'h3', 'blockquote', 'pre', 'code',
      'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a', 'br', 'figure', 'figcaption', 'img'],
    allowedAttributes: { a: ['href', 'target', 'rel'], img: ['src', 'alt', 'width', 'height', 'loading'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https', 'data'] },
    transformTags: {
      a: (_tag, attrs) => {
        const href = attrs.href || '#';
        const attribs: Record<string, string> = /^(https?:\/\/|mailto:)/i.test(href)
          ? { href, target: '_blank', rel: 'noopener noreferrer' }
          : { href };
        return { tagName: 'a', attribs };
      },
      img: (_tag, attrs) => {
        const attribs: Record<string, string> = {
          src: attrs.src || '',
          alt: (attrs.alt || '').slice(0, 240),
          loading: attrs.loading === 'eager' ? 'eager' : 'lazy',
        };
        if (attrs.width && /^\d{1,5}$/.test(attrs.width)) attribs.width = attrs.width;
        if (attrs.height && /^\d{1,5}$/.test(attrs.height)) attribs.height = attrs.height;
        return { tagName: 'img', attribs };
      },
    },
    exclusiveFilter: frame => frame.tag === 'img' && (!frame.attribs.src
      || (/^data:/i.test(frame.attribs.src) && !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(frame.attribs.src))),
  });
}
