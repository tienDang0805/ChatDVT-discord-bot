import { useState, type ReactNode } from 'react';
import { Check, Copy, FileCode2 } from 'lucide-react';

interface ConfigCodeBlockProps {
  title: string;
  path: string;
  language: 'toml' | 'yaml' | 'md' | 'shell';
  code: string;
  annotations?: Record<number, string>;
  compact?: boolean;
}

function findInlineComment(text: string): number {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === '#' && !inSingle && !inDouble && (i === 0 || text[i - 1] === ' ')) {
      return i;
    }
  }
  return -1;
}

function highlightValue(raw: string, language: 'toml' | 'yaml' | 'md' | 'shell'): ReactNode {
  const commentIdx = language === 'md' ? -1 : findInlineComment(raw);
  const codePart = commentIdx >= 0 ? raw.slice(0, commentIdx) : raw;
  const commentPart = commentIdx >= 0 ? raw.slice(commentIdx) : '';
  const tokens = codePart.split(/("[^"]*"|'[^']*'|\b(?:true|false|null)\b|\b\d+(?:_\d+)*\b)/g);

  return (
    <>
      {tokens.map((tok, i) => {
        if (!tok) return null;
        if ((tok.startsWith('"') && tok.endsWith('"')) || (tok.startsWith("'") && tok.endsWith("'"))) {
          return <span key={i} className="tdw-tok-str">{tok}</span>;
        }
        if (/^(true|false|null)$/.test(tok)) {
          return <span key={i} className="tdw-tok-bool">{tok}</span>;
        }
        if (/^\d+(?:_\d+)*$/.test(tok)) {
          return <span key={i} className="tdw-tok-num">{tok}</span>;
        }
        return <span key={i} className="tdw-tok-val">{tok}</span>;
      })}
      {commentPart && <span className="tdw-tok-cmt">{commentPart}</span>}
    </>
  );
}

function highlightLine(line: string, language: 'toml' | 'yaml' | 'md' | 'shell'): ReactNode {
  const trimmed = line.trim();
  if (!trimmed) return '\u00A0';
  if (language !== 'md' && trimmed.startsWith('#')) {
    return <span className="tdw-tok-cmt">{line}</span>;
  }
  if (language === 'md') {
    if (trimmed.startsWith('#')) return <span className="tdw-tok-sec">{line}</span>;
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const idx = line.indexOf(trimmed[0]);
      return (
        <>
          <span className="tdw-tok-key">{line.slice(0, idx + 1)}</span>
          {highlightValue(line.slice(idx + 1), 'md')}
        </>
      );
    }
    return highlightValue(line, 'md');
  }
  if (language === 'toml' && trimmed.startsWith('[')) {
    return <span className="tdw-tok-sec">{line}</span>;
  }
  if (language === 'toml') {
    const eqIdx = line.indexOf('=');
    if (eqIdx > 0) {
      return (
        <>
          <span className="tdw-tok-key">{line.slice(0, eqIdx)}</span>
          <span className="tdw-tok-punct">=</span>
          {highlightValue(line.slice(eqIdx + 1), 'toml')}
        </>
      );
    }
  }
  if (language === 'yaml') {
    const listMatch = /^(\s*-\s+)(.*)$/.exec(line);
    if (listMatch) {
      const [, prefix, rest] = listMatch;
      const colonIdx = rest.indexOf(':');
      if (colonIdx > 0) {
        return (
          <>
            <span className="tdw-tok-punct">{prefix}</span>
            <span className="tdw-tok-key">{rest.slice(0, colonIdx)}</span>
            <span className="tdw-tok-punct">:</span>
            {highlightValue(rest.slice(colonIdx + 1), 'yaml')}
          </>
        );
      }
      return (
        <>
          <span className="tdw-tok-punct">{prefix}</span>
          {highlightValue(rest, 'yaml')}
        </>
      );
    }
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0 && !line.slice(0, colonIdx).includes('http')) {
      return (
        <>
          <span className="tdw-tok-key">{line.slice(0, colonIdx)}</span>
          <span className="tdw-tok-punct">:</span>
          {highlightValue(line.slice(colonIdx + 1), 'yaml')}
        </>
      );
    }
  }
  return highlightValue(line, language);
}

export function ConfigCodeBlock({
  title,
  path,
  language,
  code,
  annotations,
  compact = false,
}: ConfigCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.trimEnd().split('\n');

  function handleCopy() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className={`tdw-code-card ${compact ? 'is-compact' : ''}`}>
      <div className="tdw-code-head">
        <div className="tdw-code-dots" aria-hidden="true">
          <i /><i /><i />
        </div>
        <div className="tdw-code-file">
          <FileCode2 size={13} />
          <strong>{title}</strong>
          <span>{path}</span>
        </div>
        <div className="tdw-code-actions">
          <em className="tdw-code-lang">{language.toUpperCase()}</em>
          <button type="button" className="tdw-copy-btn" onClick={handleCopy}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Đã chép' : 'Chép'}</span>
          </button>
        </div>
      </div>
      <div className="tdw-code-body">
        {lines.map((line, idx) => {
          const lineNo = idx + 1;
          const note = annotations?.[lineNo];
          return (
            <div key={lineNo} className={`tdw-code-line ${note ? 'has-note' : ''}`}>
              <span className="tdw-ln">{lineNo}</span>
              <code className="tdw-lc">{highlightLine(line, language)}</code>
              {note && <span className="tdw-line-note">{note}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
