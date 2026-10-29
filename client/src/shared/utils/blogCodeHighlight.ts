export type CodeLanguage = 'bash' | 'toml' | 'yaml' | 'json' | 'ts' | 'kotlin';

const LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  bash: 'SHELL',
  toml: 'TOML',
  yaml: 'YAML',
  json: 'JSON',
  ts: 'TS / JS',
  kotlin: 'KOTLIN',
};

function decodeHtmlEntities(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapToken(type: string, value: string): string {
  return `<span class="token ${type}">${escapeHtml(value)}</span>`;
}

export function detectCodeLanguage(code: string, classHint = ''): CodeLanguage {
  const hint = classHint.toLowerCase();
  if (hint.includes('toml') || hint.includes('ini')) return 'toml';
  if (hint.includes('yaml') || hint.includes('yml')) return 'yaml';
  if (hint.includes('json')) return 'json';
  if (hint.includes('kotlin') || hint.includes('kt') || hint.includes('java')) return 'kotlin';
  if (hint.includes('ts') || hint.includes('js') || hint.includes('tsx') || hint.includes('jsx')) return 'ts';
  if (hint.includes('bash') || hint.includes('sh') || hint.includes('zsh') || hint.includes('shell')) return 'bash';

  const trimmed = code.trim();
  if (
    /^\s*\[[a-zA-Z0-9_.*-]+\]/m.test(trimmed) &&
    /^\s*[a-zA-Z0-9_-]+\s*=\s*/m.test(trimmed) &&
    !/\b(?:brew|curl|mkdir|cat|cp|open|npm|echo|jq)\b/.test(trimmed)
  ) {
    return 'toml';
  }
  if (/^[\[{][\s\S]*[\]}]$/.test(trimmed) && /"[^"]+"\s*:/.test(trimmed)) {
    return 'json';
  }
  if (
    /^\s*[a-zA-Z0-9_-]+:\s+/m.test(trimmed) &&
    !/\b(?:brew|curl|mkdir|cat|cp|open|npm|echo|jq|alias|source)\b/.test(trimmed)
  ) {
    return 'yaml';
  }
  if (/\b(?:fun|val|var|override|suspend|companion)\b/.test(trimmed) && /:\s*[A-Z][A-Za-z0-9_<>,?]+/.test(trimmed)) {
    return 'kotlin';
  }
  if (/\b(?:interface|const|let|function|export|import)\b/.test(trimmed) && /[;{()=>]/.test(trimmed) && !/\b(?:brew|curl|mkdir|jq)\b/.test(trimmed)) {
    return 'ts';
  }
  return 'bash';
}

const TOKEN_PATTERN = new RegExp(
  [
    // 1. Comments (# ... or // ... or /* ... */)
    '(?<comment>(?:^|(?<=\\s))#[^\\n]*|\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)',
    // 2. TOML section header ([model_providers.cliproxy])
    '(?<section>^\\s*\\[[a-zA-Z0-9_.*-]+\\])',
    // 3. Double or single quoted strings
    '(?<string>"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\')',
    // 4. Environment / shell variables ($HOME, ${VAR}, VAR= at line/command start)
    '(?<variable>\\$\\{?[a-zA-Z_][a-zA-Z0-9_]*\\}?|\\b[A-Z_][A-Z0-9_]{2,}(?=\\=))',
    // 5. Key / property in TOML, YAML, or JSON/object literal
    '(?<property>^\\s*[a-zA-Z0-9_-]+(?=\\s*=\\s*)|^\\s*[a-zA-Z0-9_-]+(?=\\s*:)|\\b[a-zA-Z_][a-zA-Z0-9_]*(?=\\s*:(?!\\/\\/)))',
    // 6. CLI flags (--config, -H, -d, etc.)
    '(?<flag>(?<=\\s|^)--?[a-zA-Z0-9][a-zA-Z0-9_-]*)',
    // 7. Keywords & shell control words & heredoc tags
    '(?<keyword>\\b(?:if|then|else|elif|fi|for|in|do|done|while|case|esac|function|return|export|source|alias|select|const|let|var|async|await|import|from|interface|type|class|fun|val|true|false|null|END_CFG|END_ZSH|END_SOL|END_NOTE)\\b)',
    // 8. Common CLI & builtin commands
    '(?<builtin>\\b(?:brew|cliproxyapi|mkdir|cat|cp|mv|rm|open|curl|jq|grep|tail|head|wc|ls|npm|npx|node|codex|echo|git|adb|docker|services|install|restart|list)\\b)',
    // 9. Numbers
    '(?<number>\\b\\d+(?:\\.\\d+)?\\b)',
    // 10. Operators & redirections
    '(?<operator>2>\\/dev\\/null|>>|<<|\\|\\||&&|[|><=\\\\])',
    // 11. Punctuation
    '(?<punctuation>[{}()[\\].,:;])',
  ].join('|'),
  'gm'
);

export function highlightCodeWithPrismTokens(code: string): string {
  let result = '';
  let lastIndex = 0;

  for (const match of code.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      result += escapeHtml(code.slice(lastIndex, index));
    }
    const groups = match.groups || {};
    const full = match[0];

    if (groups.comment !== undefined) {
      result += wrapToken('comment', full);
    } else if (groups.section !== undefined) {
      const leading = full.match(/^\s*/)?.[0] || '';
      result += escapeHtml(leading) + wrapToken('section', full.slice(leading.length));
    } else if (groups.string !== undefined) {
      result += wrapToken('string', full);
    } else if (groups.variable !== undefined) {
      result += wrapToken('variable', full);
    } else if (groups.property !== undefined) {
      const leading = full.match(/^\s*/)?.[0] || '';
      result += escapeHtml(leading) + wrapToken('property', full.slice(leading.length));
    } else if (groups.flag !== undefined) {
      result += wrapToken('flag', full);
    } else if (groups.keyword !== undefined) {
      result += wrapToken('keyword', full);
    } else if (groups.builtin !== undefined) {
      result += wrapToken('function', full);
    } else if (groups.number !== undefined) {
      result += wrapToken('number', full);
    } else if (groups.operator !== undefined) {
      result += wrapToken('operator', full);
    } else if (groups.punctuation !== undefined) {
      result += wrapToken('punctuation', full);
    } else {
      result += escapeHtml(full);
    }

    lastIndex = index + full.length;
  }

  if (lastIndex < code.length) {
    result += escapeHtml(code.slice(lastIndex));
  }

  return result;
}

export function enhanceBlogCodeBlocks(sanitizedHtml: string, locale: 'vi' | 'en' = 'vi'): string {
  if (!sanitizedHtml || !sanitizedHtml.includes('<pre')) return sanitizedHtml;
  const copyAria = locale === 'en' ? 'Copy command' : 'Sao chép mã lệnh';

  return sanitizedHtml.replace(
    /<pre([^>]*)>\s*(?:<code([^>]*)>([\s\S]*?)<\/code>|([\s\S]*?))\s*<\/pre>/gi,
    (_full, preAttrs: string = '', codeAttrs: string = '', codeInner?: string, rawPreInner?: string) => {
      const rawHtml = codeInner !== undefined ? codeInner : (rawPreInner || '');
      const rawCode = decodeHtmlEntities(rawHtml).replace(/^\n+|\n+$/g, '');
      const lang = detectCodeLanguage(rawCode, `${preAttrs} ${codeAttrs}`);
      const langLabel = LANGUAGE_LABELS[lang];
      const highlighted = highlightCodeWithPrismTokens(rawCode);

      return (
        `<div class="blog-code-frame" data-language="${lang}">` +
        `<div class="blog-code-header">` +
        `<span class="blog-code-lang"><i aria-hidden="true"></i>${langLabel}</span>` +
        `<button type="button" class="blog-code-copy" data-copy-code="true" aria-label="${copyAria}">` +
        `<svg class="blog-code-copy__icon blog-code-copy__icon--copy" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>` +
        `<svg class="blog-code-copy__icon blog-code-copy__icon--check" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>` +
        `<span class="blog-code-copy__text">Copy</span>` +
        `</button>` +
        `</div>` +
        `<pre class="language-${lang}" tabindex="0"><code class="language-${lang}">${highlighted}</code></pre>` +
        `</div>`
      );
    }
  );
}
