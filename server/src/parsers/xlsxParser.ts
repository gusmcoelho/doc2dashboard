import * as XLSX from 'xlsx';
import { SupportedFileType } from '../types';

export interface ParsedXlsxOutput {
  fileName: string;
  fileType: SupportedFileType;
  fileSizeBytes: number;
  availableSheets: string[];
  activeSheet: string;
  records: Array<Record<string, any>>;
}

export function parseXlsxBuffer(
  buffer: Buffer,
  fileName: string,
  targetSheet?: string
): ParsedXlsxOutput {
  const isCsv = fileName.toLowerCase().endsWith('.csv');
  const fileType: SupportedFileType = isCsv
    ? 'csv'
    : fileName.toLowerCase().endsWith('.xls')
      ? 'xls'
      : 'xlsx';

  const workbook = XLSX.read(buffer, {
    type: 'buffer',
    cellDates: true,
    cellNF: false,
    cellText: false,
    raw: false,
  });

  const availableSheets = workbook.SheetNames;
  if (availableSheets.length === 0) {
    return {
      fileName,
      fileType,
      fileSizeBytes: buffer.length,
      availableSheets: [],
      activeSheet: '',
      records: [],
    };
  }

  const activeSheet =
    targetSheet && availableSheets.includes(targetSheet) ? targetSheet : availableSheets[0];

  const worksheet = workbook.Sheets[activeSheet];
  const rawRows: Array<Record<string, any>> = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false,
  });

  const cleanedRecords = rawRows.filter((row) => {
    const values = Object.values(row);
    return values.some((v) => v !== '' && v !== null && v !== undefined);
  });

  return {
    fileName,
    fileType,
    fileSizeBytes: buffer.length,
    availableSheets,
    activeSheet,
    records: cleanedRecords,
  };
}
