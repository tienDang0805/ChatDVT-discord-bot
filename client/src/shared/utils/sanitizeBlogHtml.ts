const ALLOWED_TAGS = new Set([
  'P', 'DIV', 'SPAN', 'H2', 'H3', 'BLOCKQUOTE', 'PRE', 'CODE',
  'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'A', 'BR',
  'FIGURE', 'FIGCAPTION', 'IMG',
]);

function isSafeLink(value: string): boolean {
  return /^(https?:\/\/|mailto:|\/|#)/i.test(value);
}

function isSafeImage(value: string): boolean {
  return /^(https?:\/\/|\/)/i.test(value)
    || /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value);
}

export function sanitizeBlogHtml(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html;

  const elements = Array.from(template.content.querySelectorAll('*'));
  elements.forEach((element) => {
    if (!ALLOWED_TAGS.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    const href = element instanceof HTMLAnchorElement ? element.getAttribute('href') || '' : '';
    const src = element instanceof HTMLImageElement ? element.getAttribute('src') || '' : '';
    const alt = element instanceof HTMLImageElement ? element.getAttribute('alt') || '' : '';

    Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name));

    if (element instanceof HTMLAnchorElement) {
      element.href = isSafeLink(href) ? href : '#';
      element.target = '_blank';
      element.rel = 'noopener noreferrer';
    }

    if (element instanceof HTMLImageElement) {
      if (!isSafeImage(src)) {
        element.remove();
        return;
      }
      element.src = src;
      element.alt = alt.slice(0, 240);
      element.loading = 'lazy';
    }
  });

  return template.innerHTML;
}
