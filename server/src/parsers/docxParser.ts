import * as mammoth from 'mammoth';
import { DocumentTextSummary } from '../types';

export interface ParsedDocxOutput {
  fileName: string;
  fileType: 'docx';
  fileSizeBytes: number;
  records: Array<Record<string, any>>;
  textSummary: DocumentTextSummary;
}

function extractTablesFromHtml(html: string): Array<Array<string[]>> {
  const tables: Array<Array<string[]>> = [];
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch: RegExpExecArray | null;

  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const tableContent = tableMatch[1];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch: RegExpExecArray | null;
    const tableRows: string[][] = [];

    while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
      const rowContent = rowMatch[1];
      const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
      let cellMatch: RegExpExecArray | null;
      const cells: string[] = [];

      while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
        const cleanCell = cellMatch[1]
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim();
        cells.push(cleanCell);
      }

      if (cells.length > 0) {
        tableRows.push(cells);
      }
    }

    if (tableRows.length > 0) {
      tables.push(tableRows);
    }
  }

  return tables;
}

function extractHeadingsFromHtml(html: string): string[] {
  const headings: string[] = [];
  const headingRegex = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text) {
      headings.push(text);
    }
  }

  return headings;
}

export async function parseDocxBuffer(buffer: Buffer, fileName: string): Promise<ParsedDocxOutput> {
  const [htmlResult, rawTextResult] = await Promise.all([
    mammoth.convertToHtml({ buffer }),
    mammoth.extractRawText({ buffer }),
  ]);

  const html = htmlResult.value || '';
  const rawText = rawTextResult.value || '';

  const words = rawText.trim().split(/\s+/).filter(Boolean);
  const paragraphs = rawText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const textSummary: DocumentTextSummary = {
    wordCount: words.length,
    characterCount: rawText.length,
    paragraphsCount: paragraphs.length,
    preview: rawText.slice(0, 500).trim(),
    extractedHeadings: extractHeadingsFromHtml(html),
  };

  const tables = extractTablesFromHtml(html);
  let records: Array<Record<string, any>> = [];

  if (tables.length > 0) {
    const primaryTable = tables[0];
    if (primaryTable.length > 1) {
      const headers = primaryTable[0].map((h, i) => h || `Coluna_${i + 1}`);
      for (let r = 1; r < primaryTable.length; r++) {
        const row = primaryTable[r];
        const record: Record<string, any> = {};
        for (let c = 0; c < headers.length; c++) {
          record[headers[c]] = row[c] !== undefined ? row[c] : '';
        }
        records.push(record);
      }
    }
  }

  if (records.length === 0) {
    const keyValueRows: Array<Record<string, any>> = [];
    for (const paragraph of paragraphs) {
      const kvMatch = /^([^:\n]{2,40}):\s*(.+)$/.exec(paragraph);
      if (kvMatch) {
        keyValueRows.push({
          Item: kvMatch[1].trim(),
          Valor: kvMatch[2].trim(),
        });
      }
    }

    if (keyValueRows.length >= 2) {
      records = keyValueRows;
    } else {
      records = paragraphs.map((p, idx) => ({
        Secao: `Parágrafo ${idx + 1}`,
        Texto: p.length > 100 ? `${p.slice(0, 100)}...` : p,
        Caracteres: p.length,
        Palavras: p.split(/\s+/).filter(Boolean).length,
      }));
    }
  }

  return {
    fileName,
    fileType: 'docx',
    fileSizeBytes: buffer.length,
    records,
    textSummary,
  };
}
