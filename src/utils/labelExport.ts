import type { LabelBatch } from '../types';
import type { OutputRow } from './grouping';

/** Combined line as written on the manual sheet: NAKD1-8FL64/SRV010001 - 4 CLL */
export function formatLine(e: OutputRow): string {
  const del = e.deliveryNumber.trim().toUpperCase();
  const ref = e.referenceNumber.trim().toUpperCase();
  const qty = e.quantity.trim();
  const head = ref ? `${del}/${ref}` : del;
  return qty ? `${head} - ${qty} CLL` : head;
}

/** Human date for headers: "10/07/2026". */
export function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function safeName(batch: LabelBatch, ext: string): string {
  const base = (batch.title || 'labels')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  return `${base || 'labels'}_${batch.date}.${ext}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ------------------------------- Word (.docx) ------------------------------ */

export async function exportWord(batch: LabelBatch, rows: OutputRow[]): Promise<void> {
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
    Table, TableRow, TableCell, WidthType, BorderStyle,
  } = await import('docx');

  const thinBorders = () => {
    const b = { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' };
    return { top: b, bottom: b, left: b, right: b };
  };
  const cell = (text: string) =>
    new TableCell({
      margins: { top: 60, bottom: 60, left: 90, right: 90 },
      borders: thinBorders(),
      children: [new Paragraph({ children: [new TextRun({ text, size: 30 })] })],
    });

  const headerCells = ['#', 'Delivery number', 'Reference', 'CLL'];

  const headerRow = new TableRow({
    tableHeader: true,
    children: headerCells.map(
      (t) =>
        new TableCell({
          shading: { fill: 'E5E7EB' },
          margins: { top: 60, bottom: 60, left: 90, right: 90 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: t, bold: true, size: 30 })],
            }),
          ],
        })
    ),
  });

  const bodyRows = rows.map((e, i) =>
    new TableRow({
      children: [
        cell(String(i + 1)),
        cell(e.deliveryNumber || '—'),
        cell(e.referenceNumber || '—'),
        cell(e.quantity || '—'),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: batch.title || 'Delivery labels', bold: true, size: 52 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: `DATO: ${formatDate(batch.date)}`, size: 34, bold: true }),
              ...(batch.pallet
                ? [new TextRun({ text: `     PALLE: ${batch.pallet}`, size: 34, bold: true })]
                : []),
            ],
          }),
          new Paragraph({ text: '' }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [headerRow, ...bodyRows],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Total rows: ${rows.length}`,
                italics: true,
                size: 24,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, safeName(batch, 'docx'));
}

/* ------------------------------ Excel (.xlsx) ------------------------------ */

export async function exportExcel(batch: LabelBatch, rows: OutputRow[]): Promise<void> {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Delivery Label Extractor';
  wb.created = new Date();
  const ws = wb.addWorksheet('Labels');

  ws.columns = [
    { header: '#', key: 'idx', width: 6 },
    { header: 'Delivery number', key: 'delivery', width: 22 },
    { header: 'Reference', key: 'reference', width: 18 },
    { header: 'CLL', key: 'qty', width: 8 },
    { header: 'Line', key: 'line', width: 34 },
  ];

  // Title + meta block above the table.
  ws.spliceRows(1, 0, [batch.title || 'Delivery labels']);
  ws.spliceRows(2, 0, [`DATO: ${formatDate(batch.date)}`, batch.pallet ? `PALLE: ${batch.pallet}` : '']);
  ws.spliceRows(3, 0, []);
  ws.mergeCells('A1:E1');
  ws.getCell('A1').font = { size: 14, bold: true };
  ws.getCell('A2').font = { bold: true };

  const headerRowNumber = 4;
  const header = ws.getRow(headerRowNumber);
  header.values = ['#', 'Delivery number', 'Reference', 'CLL', 'Line'];
  header.font = { bold: true };
  header.eachCell((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
    c.border = { bottom: { style: 'thin' } };
  });

  rows.forEach((e, i) => {
    ws.addRow({
      idx: i + 1,
      delivery: e.deliveryNumber,
      reference: e.referenceNumber,
      qty: e.quantity,
      line: formatLine(e),
    });
  });

  const buf = await wb.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    safeName(batch, 'xlsx')
  );
}

/* --------------------------------- Print ---------------------------------- */

export function printBatch(batch: LabelBatch, rows: OutputRow[]): void {
  const rowsHtml = rows
    .map(
      (e, i) => `
      <tr>
        <td class="num">${i + 1}</td>
        <td>${escapeHtml(e.deliveryNumber) || '&nbsp;'}</td>
        <td>${escapeHtml(e.referenceNumber) || '&nbsp;'}</td>
        <td class="num">${escapeHtml(e.quantity) || '&nbsp;'}</td>
      </tr>`
    )
    .join('');

  const html = `<!doctype html><html><head><meta charset="utf-8">
    <title>${escapeHtml(batch.title)}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 24px; }
      h1 { font-size: 34px; text-align: center; margin: 0 0 8px; text-transform: uppercase; }
      .meta { text-align: center; font-size: 24px; margin-bottom: 22px; font-weight: bold; }
      .meta .pallet { margin-left: 28px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1.5px solid #666; padding: 12px 14px; font-size: 22px; text-align: left; }
      th { background: #eee; font-size: 20px; }
      td.num, th.num { text-align: center; width: 60px; }
      tfoot td { border: none; font-style: italic; font-size: 18px; padding-top: 14px; }
      @media print { body { margin: 12mm; } }
    </style></head><body>
      <h1>${escapeHtml(batch.title) || 'Delivery labels'}</h1>
      <div class="meta">DATO: ${escapeHtml(formatDate(batch.date))}${
        batch.pallet ? `<span class="pallet">PALLE: ${escapeHtml(batch.pallet)}</span>` : ''
      }</div>
      <table>
        <thead><tr><th class="num">#</th><th>Delivery number</th><th>Reference</th><th class="num">CLL</th></tr></thead>
        <tbody>${rowsHtml || '<tr><td colspan="4">No entries</td></tr>'}</tbody>
        <tfoot><tr><td colspan="4">Total rows: ${rows.length}</td></tr></tfoot>
      </table>
      <script>window.onload = function(){ window.print(); }</script>
    </body></html>`;

  const w = window.open('', '_blank');
  if (!w) {
    alert('Please allow pop-ups to print.');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

/* --------------------------------- Email ---------------------------------- */

export function emailBatch(batch: LabelBatch, rows: OutputRow[]): void {
  const subject = `${batch.title} — ${formatDate(batch.date)}`;
  const lines = rows.map((e, i) => `${i + 1}. ${formatLine(e)}`);
  const body = [
    batch.title,
    `DATO: ${formatDate(batch.date)}${batch.pallet ? `   PALLE: ${batch.pallet}` : ''}`,
    '',
    ...lines,
    '',
    `Total rows: ${rows.length}`,
    '',
    '(Tip: attach the Excel or Word file you downloaded.)',
  ].join('\n');
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function escapeHtml(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
