import { ParsedDocumentResult, SupportedFileType } from '../types';
import { parseXlsxBuffer } from './xlsxParser';
import { parseDocxBuffer } from './docxParser';
import { parsePdfBuffer } from './pdfParser';
import { analyzeDataset } from '../engine/statisticsCalculator';

export function resolveFileType(fileName: string): SupportedFileType | null {
  const ext = fileName.toLowerCase().split('.').pop();
  switch (ext) {
    case 'xlsx':
      return 'xlsx';
    case 'xls':
      return 'xls';
    case 'csv':
      return 'csv';
    case 'docx':
      return 'docx';
    case 'pdf':
      return 'pdf';
    default:
      return null;
  }
}

export async function parseDocument(
  buffer: Buffer,
  fileName: string,
  targetSheet?: string
): Promise<ParsedDocumentResult> {
  const fileType = resolveFileType(fileName);
  if (!fileType) {
    throw new Error(`Tipo de arquivo não suportado: ${fileName}`);
  }

  if (fileType === 'xlsx' || fileType === 'xls' || fileType === 'csv') {
    const parsed = parseXlsxBuffer(buffer, fileName, targetSheet);
    const { columns, normalizedRecords } = analyzeDataset(parsed.records);
    return {
      fileName: parsed.fileName,
      fileType: parsed.fileType,
      fileSizeBytes: parsed.fileSizeBytes,
      columns,
      records: normalizedRecords,
      availableSheets: parsed.availableSheets,
    };
  }

  if (fileType === 'docx') {
    const parsed = await parseDocxBuffer(buffer, fileName);
    const { columns, normalizedRecords } = analyzeDataset(parsed.records);
    return {
      fileName: parsed.fileName,
      fileType: parsed.fileType,
      fileSizeBytes: parsed.fileSizeBytes,
      columns,
      records: normalizedRecords,
      textSummary: parsed.textSummary,
    };
  }

  if (fileType === 'pdf') {
    const parsed = await parsePdfBuffer(buffer, fileName);
    const { columns, normalizedRecords } = analyzeDataset(parsed.records);
    return {
      fileName: parsed.fileName,
      fileType: parsed.fileType,
      fileSizeBytes: parsed.fileSizeBytes,
      columns,
      records: normalizedRecords,
      textSummary: parsed.textSummary,
    };
  }

  throw new Error(`Processamento indisponível para o formato: ${fileType}`);
}
