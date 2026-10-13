/** CodeMirror stores each line break as one position; source spans use raw UTF-16. */
export const editorText = (raw: string) => raw.replace(/\r\n?/g, '\n');
export function rawToEditorOffset(raw: string, offset: number): number {
  return editorText(raw.slice(0, Math.max(0, Math.min(offset, raw.length)))).length;
}
export function editorToRawOffset(raw: string, offset: number): number {
  let extra = 0;
  for (const match of raw.matchAll(/\r\n/g)) {
    if (match.index! - extra >= offset) break;
    extra++;
  }
  return Math.min(raw.length, Math.max(0, offset + extra));
}
