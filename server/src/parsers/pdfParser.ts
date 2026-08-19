import pdfParse from 'pdf-parse';
import { DocumentTextSummary } from '../types';

export interface ParsedPdfOutput {
  fileName: string;
  fileType: 'pdf';
  fileSizeBytes: number;
  records: Array<Record<string, any>>;
  textSummary: DocumentTextSummary;
}

function extractTableFromLines(lines: string[]): Array<Record<string, any>> {
  const candidateRows: string[][] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.includes('|')) {
      const cells = trimmed
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean);
      if (cells.length >= 2) {
        candidateRows.push(cells);
        continue;
      }
    }

    if (trimmed.includes('\t')) {
      const cells = trimmed
        .split('\t')
        .map((c) => c.trim())
        .filter(Boolean);
      if (cells.length >= 2) {
        candidateRows.push(cells);
        continue;
      }
    }

    if (trimmed.includes(';') && !trimmed.includes('&')) {
      const cells = trimmed
        .split(';')
        .map((c) => c.trim())
        .filter(Boolean);
      if (cells.length >= 2) {
        candidateRows.push(cells);
        continue;
      }
    }

    const multiSpaceSplit = trimmed
      .split(/\s{2,}/)
      .map((c) => c.trim())
      .filter(Boolean);
    if (multiSpaceSplit.length >= 2) {
      candidateRows.push(multiSpaceSplit);
    }
  }

  if (candidateRows.length >= 2) {
    const columnCount = candidateRows[0].length;
    const consistentRows = candidateRows.filter(
      (row) => Math.abs(row.length - columnCount) <= 1 && row.length >= 2
    );

    if (consistentRows.length >= 2) {
      const headers = consistentRows[0].map((h, i) => h || `Coluna_${i + 1}`);
      const records: Array<Record<string, any>> = [];

      for (let r = 1; r < consistentRows.length; r++) {
        const row = consistentRows[r];
        const record: Record<string, any> = {};
        for (let c = 0; c < headers.length; c++) {
          record[headers[c]] = row[c] !== undefined ? row[c] : '';
        }
        records.push(record);
      }

      if (records.length > 0) {
        return records;
      }
    }
  }

  const keyValueRows: Array<Record<string, any>> = [];
  for (const line of lines) {
    const kvMatch = /^([^:\n]{2,35}):\s*(.+)$/.exec(line.trim());
    if (kvMatch) {
      keyValueRows.push({
        Item: kvMatch[1].trim(),
        Valor: kvMatch[2].trim(),
      });
    }
  }

  if (keyValueRows.length >= 2) {
    return keyValueRows;
  }

  return [];
}

export async function parsePdfBuffer(buffer: Buffer, fileName: string): Promise<ParsedPdfOutput> {
  let rawText = '';
  try {
    const pdfData = await pdfParse(buffer);
    rawText = pdfData.text || '';
  } catch {
    const textCandidate = buffer.toString('utf-8');
    const isPrintable = /^[\p{L}\p{N}\p{P}\p{Z}\s\n\r]+$/u.test(textCandidate.slice(0, 100));
    if (isPrintable && textCandidate.trim().length > 0) {
      rawText = textCandidate;
    } else {
      throw new Error('O arquivo PDF está corrompido ou em formato inválido.');
    }
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Extract meaningful narrative paragraphs (grouped by double newlines or non-table lines)
  const rawParagraphs = rawText
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 10 && !p.includes('|') && !p.includes('\t'));

  const headings: string[] = [];
  for (const line of lines) {
    if (/^[#A-Z0-9\s—:-]{4,60}$/.test(line) && line.length < 50 && !line.includes('|')) {
      if (!headings.includes(line)) {
        headings.push(line);
      }
    }
  }

  const words = rawText.trim().split(/\s+/).filter(Boolean);

  const textSummary: DocumentTextSummary = {
    wordCount: words.length,
    characterCount: rawText.length,
    paragraphsCount: rawParagraphs.length || 1,
    preview: rawParagraphs.slice(0, 3).join('\n\n') || rawText.slice(0, 400).trim(),
    extractedHeadings: headings.slice(0, 6),
  };

  let records = extractTableFromLines(lines);

  if (records.length === 0 && lines.length > 0) {
    records = lines.slice(0, 50).map((line, idx) => ({
      Linha: idx + 1,
      Conteudo: line.length > 80 ? `${line.slice(0, 80)}...` : line,
      Caracteres: line.length,
      Palavras: line.split(/\s+/).filter(Boolean).length,
    }));
  }

  return {
    fileName,
    fileType: 'pdf',
    fileSizeBytes: buffer.length,
    records,
    textSummary,
  };
}
