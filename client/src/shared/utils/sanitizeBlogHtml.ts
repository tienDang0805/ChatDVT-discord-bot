import sanitizeHtml from 'sanitize-html';

// Use one parser and policy on the server and browser, including decoded URLs.
export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'div', 'span', 'h2', 'h3', 'blockquote', 'pre', 'code',
      'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a', 'br', 'figure', 'figcaption', 'img'],
    allowedAttributes: { a: ['href', 'target', 'rel'], img: ['src', 'alt', 'loading'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https', 'data'] },
    transformTags: {
      a: (_tag, attrs) => ({ tagName: 'a', attribs: { href: attrs.href || '#', target: '_blank', rel: 'noopener noreferrer' } }),
      img: (_tag, attrs) => ({ tagName: 'img', attribs: { src: attrs.src || '', alt: (attrs.alt || '').slice(0, 240), loading: 'lazy' } }),
    },
    exclusiveFilter: frame => frame.tag === 'img' && (!frame.attribs.src
      || (/^data:/i.test(frame.attribs.src) && !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(frame.attribs.src))),
  });
}
