import mermaid from 'mermaid';

async function renderAllMermaidToSvg(blocks: { type: string; content: string }[]): Promise<Map<number, string>> {
  const svgMap = new Map<number, string>();
  let counter = 0;
  mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose', fontFamily: 'Inter, system-ui, sans-serif' });

  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].type !== 'mermaid') continue;
    try {
      counter++;
      const { svg } = await mermaid.render(`export-render-${counter}-${Date.now()}`, blocks[i].content);
      svgMap.set(i, svg);
    } catch {
      svgMap.set(i, `<div style="color:red;padding:20px;border:1px solid red;border-radius:8px;">⚠️ Diagram render error</div>`);
    }
  }
  return svgMap;
}

function markdownToHtml(md: string): string {
  let html = md;

  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');

  const tableRegex = /\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/g;
  html = html.replace(tableRegex, (_match, header: string, body: string) => {
    const headers = header.split('|').map((h: string) => h.trim()).filter(Boolean);
    const rows = body.trim().split('\n').map((row: string) =>
      row.split('|').map((c: string) => c.trim()).filter(Boolean)
    );
    let table = '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;margin:16px 0;border-color:#e2e8f0;font-size:14px;">';
    table += '<thead><tr>' + headers.map(h => `<th style="background:#f1f5f9;text-align:left;padding:10px 14px;font-weight:700;border:1px solid #e2e8f0;">${h}</th>`).join('') + '</tr></thead>';
    table += '<tbody>' + rows.map(row => '<tr>' + row.map(c => `<td style="padding:10px 14px;border:1px solid #e2e8f0;">${c}</td>`).join('') + '</tr>').join('') + '</tbody>';
    table += '</table>';
    return table;
  });

  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/(?<!<\/?\w[^>]*)\n(?!<)/g, '<br>');

  return html;
}

function buildExportHtml(blocks: { type: string; content: string }[], svgMap: Map<number, string>, title: string): string {
  const styles = `
    body { font-family: 'Segoe UI', -apple-system, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 30px; color: #1e293b; line-height: 1.7; }
    h1 { font-size: 28px; font-weight: 800; color: #0f172a; border-bottom: 3px solid #7c3aed; padding-bottom: 12px; margin-top: 40px; }
    h2 { font-size: 22px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 36px; }
    h3 { font-size: 18px; font-weight: 600; color: #334155; margin-top: 28px; }
    p { margin: 12px 0; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 13px; color: #7c3aed; }
    blockquote { border-left: 4px solid #7c3aed; background: #f5f3ff; padding: 12px 20px; margin: 16px 0; border-radius: 0 8px 8px 0; }
    hr { border: none; border-top: 2px solid #e2e8f0; margin: 32px 0; }
    li { margin: 4px 0; margin-left: 20px; }
    .diagram-container { text-align: center; margin: 24px 0; padding: 20px; background: #fafafa; border: 1px solid #e2e8f0; border-radius: 12px; overflow-x: auto; }
    .diagram-container svg { max-width: 100%; height: auto; }
    @media print { body { padding: 20px; } .diagram-container { break-inside: avoid; page-break-inside: avoid; } }
  `;

  let body = '';
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].type === 'mermaid') {
      const svg = svgMap.get(i) || '';
      body += `<div class="diagram-container">${svg}</div>`;
    } else {
      body += `<div>${markdownToHtml(blocks[i].content)}</div>`;
    }
  }

  return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>${title}</title><style>${styles}</style></head><body>${body}</body></html>`;
}

export async function exportDocumentPdf(blocks: { type: string; content: string }[], title: string): Promise<void> {
  const svgMap = await renderAllMermaidToSvg(blocks);
  const html = buildExportHtml(blocks, svgMap, title);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 800);
  };
}

export async function exportDocumentWord(blocks: { type: string; content: string }[], title: string): Promise<void> {
  const svgMap = await renderAllMermaidToSvg(blocks);
  const html = buildExportHtml(blocks, svgMap, title);

  const wordHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="UTF-8"><title>${title}</title>
    <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
    ${html.match(/<style>([\s\S]*?)<\/style>/)?.[0] || ''}
    </head>
    <body>${html.match(/<body>([\s\S]*?)<\/body>/)?.[1] || ''}</body></html>`;

  const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword' });
  downloadBlob(blob, `${title.replace(/[^a-zA-Z0-9]/g, '_')}.doc`);
}

export async function exportDocumentHtml(blocks: { type: string; content: string }[], title: string): Promise<void> {
  const svgMap = await renderAllMermaidToSvg(blocks);
  const html = buildExportHtml(blocks, svgMap, title);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, `${title.replace(/[^a-zA-Z0-9]/g, '_')}.html`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
