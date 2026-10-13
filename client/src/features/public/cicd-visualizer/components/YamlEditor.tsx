import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, drawSelection, highlightActiveLine, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { defaultHighlightStyle, HighlightStyle, foldGutter, syntaxHighlighting } from '@codemirror/language';
import { lintGutter, setDiagnostics } from '@codemirror/lint';
import { yaml } from '@codemirror/lang-yaml';
import type { Diagnostic, SourceDocument, SourceRef } from '../core/types';
import { diagnosticText } from '../core/diagnostics';
import { editorText, rawToEditorOffset, editorToRawOffset } from '../core/sourceOffsets';

export function YamlEditor({ document, en, diagnostics, source, onChange, onCursor }: { document: SourceDocument; en: boolean; diagnostics: Diagnostic[]; source?: SourceRef; onChange: (text: string) => void; onCursor: (offset: number) => void }) {
  const host = useRef<HTMLDivElement>(null), view = useRef<EditorView>();
  const callbacks = useRef({ onChange, onCursor }); callbacks.current = { onChange, onCursor };
  const external = useRef(false), raw = useRef(document.rawText), lineEnding = useRef('\n');
  raw.current = document.rawText;
  useEffect(() => {
    if (!host.current) return;
    lineEnding.current = document.rawText.includes('\r\n') ? '\r\n' : document.rawText.includes('\r') && !document.rawText.includes('\n') ? '\r' : '\n';
    const instance = new EditorView({ parent: host.current, state: EditorState.create({ doc: editorText(document.rawText), extensions: [
      lineNumbers(), foldGutter(), history(), drawSelection(), highlightActiveLine(), yaml(), syntaxHighlighting(HighlightStyle.define(defaultHighlightStyle.specs.map(spec => ({ ...spec, color: 'var(--site-cool)' })))), lintGutter(),
      EditorView.contentAttributes.of({ 'aria-label': 'YAML workflow', spellcheck: 'false' }),
      keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
      EditorView.theme({ '&': { color: 'var(--site-ink)', backgroundColor: 'var(--site-bg)', height: '100%' }, '.cm-content': { fontFamily: 'ui-monospace, monospace', fontSize: '14px', padding: '14px 0' }, '.cm-scroller': { overflow: 'auto' }, '.cm-gutters': { backgroundColor: 'var(--site-surface)', color: 'var(--site-muted)', borderColor: 'var(--site-line)' }, '.cm-activeLine': { backgroundColor: 'var(--site-surface-2)' }, '.cm-activeLineGutter': { backgroundColor: 'var(--site-surface-2)' }, '.cm-cursor': { borderLeftColor: 'var(--site-ink)' }, '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: 'var(--site-surface-2)' } }),
      EditorView.updateListener.of(update => { if (external.current) return; if (update.docChanged) { raw.current = update.state.doc.toString().replaceAll('\n', lineEnding.current); callbacks.current.onChange(raw.current); } if (update.selectionSet) callbacks.current.onCursor(editorToRawOffset(raw.current, update.state.selection.main.head)); }),
    ] }) });
    view.current = instance;
    return () => { instance.destroy(); view.current = undefined; };
    // Keep the editor instance across ordinary keystrokes; a file switch resets its history.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document.id]);
  useEffect(() => {
    const instance = view.current;
    if (!instance || instance.state.doc.toString() === editorText(document.rawText)) return;
    external.current = true;
    instance.dispatch({ changes: { from: 0, to: instance.state.doc.length, insert: editorText(document.rawText) } });
    external.current = false;
  }, [document.rawText]);
  useEffect(() => {
    const instance = view.current;
    if (!instance) return;
    instance.dispatch(setDiagnostics(instance.state, diagnostics.filter(d => d.sourceRef?.revision === document.revision && d.sourceRef.documentId === document.id).map(d => ({ from: Math.min(rawToEditorOffset(document.rawText, d.sourceRef!.startOffset), instance.state.doc.length), to: Math.min(rawToEditorOffset(document.rawText, d.sourceRef!.endOffset), instance.state.doc.length), severity: d.severity, message: diagnosticText(d, en) }))));
  }, [diagnostics, document.id, document.revision, en]);
  useEffect(() => {
    const instance = view.current;
    if (!instance || !source || source.documentId !== document.id || source.revision !== document.revision) return;
    const from = Math.min(rawToEditorOffset(document.rawText, source.startOffset), instance.state.doc.length), to = Math.min(rawToEditorOffset(document.rawText, source.endOffset), instance.state.doc.length);
    external.current = true;
    instance.dispatch({ selection: { anchor: from, head: to }, effects: EditorView.scrollIntoView(from, { y: 'center' }) });
    external.current = false;
    instance.focus();
  }, [source, document.id, document.revision]);
  return <div ref={host} className="cicd-editor" />;
}
