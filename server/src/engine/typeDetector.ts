import { ColumnDataType } from '../types';

export function parseNumberValue(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const sanitized = trimmed
    .replace(/^[$€£R$\s]+/, '')
    .replace(/%$/, '')
    .trim();

  if (
    /^-?\d+([.,]\d+)?$/.test(sanitized) ||
    /^-?\d{1,3}(\.\d{3})*(,\d+)?$/.test(sanitized) ||
    /^-?\d{1,3}(,\d{3})*(\.\d+)?$/.test(sanitized)
  ) {
    let normalized = sanitized;
    if (normalized.includes(',') && normalized.includes('.')) {
      if (normalized.lastIndexOf(',') > normalized.lastIndexOf('.')) {
        normalized = normalized.replace(/\./g, '').replace(',', '.');
      } else {
        normalized = normalized.replace(/,/g, '');
      }
    } else if (normalized.includes(',')) {
      normalized = normalized.replace(',', '.');
    }

    const parsed = Number(normalized);
    return isNaN(parsed) ? null : parsed;
  }

  return null;
}

export function parseDateValue(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  const brDateMatch = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/.exec(trimmed);
  if (brDateMatch) {
    const day = parseInt(brDateMatch[1], 10);
    const month = parseInt(brDateMatch[2], 10) - 1;
    let year = parseInt(brDateMatch[3], 10);
    if (year < 100) {
      year += 2000;
    }
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime()) && date.getDate() === day) {
      return date;
    }
  }

  const isoTimestamp = Date.parse(trimmed);
  if (!isNaN(isoTimestamp) && isNaN(Number(trimmed))) {
    return new Date(isoTimestamp);
  }

  return null;
}

export function isBooleanValue(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return true;
  }
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();
    return ['true', 'false', 'sim', 'nao', 'não', 'yes', 'no', 'ativo', 'inativo'].includes(lower);
  }
  return false;
}

export function detectColumnType(values: unknown[], columnName = ''): ColumnDataType {
  const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== '');
  if (nonNullValues.length === 0) {
    return 'text';
  }

  const lowerName = columnName.toLowerCase();
  if (
    lowerName === 'id' ||
    lowerName.endsWith('_id') ||
    lowerName.endsWith('id') ||
    lowerName.includes('código') ||
    lowerName.includes('codigo') ||
    lowerName.includes('sku')
  ) {
    const uniqueCount = new Set(nonNullValues.map(String)).size;
    if (uniqueCount / nonNullValues.length > 0.8) {
      return 'id';
    }
  }

  let numericCount = 0;
  let dateCount = 0;
  let booleanCount = 0;

  for (const val of nonNullValues) {
    if (parseNumberValue(val) !== null) {
      numericCount++;
    }
    if (parseDateValue(val) !== null) {
      dateCount++;
    }
    if (isBooleanValue(val)) {
      booleanCount++;
    }
  }

  const sampleSize = nonNullValues.length;

  if (booleanCount / sampleSize >= 0.8) {
    return 'boolean';
  }

  if (dateCount / sampleSize >= 0.8) {
    return 'date';
  }

  if (numericCount / sampleSize >= 0.8) {
    return 'numeric';
  }

  const stringValues = nonNullValues.map((v) => String(v).trim());
  const totalLength = stringValues.reduce((acc, str) => acc + str.length, 0);
  const avgLength = totalLength / (stringValues.length || 1);
  const avgWords =
    stringValues.reduce((acc, str) => acc + str.split(/\s+/).filter(Boolean).length, 0) /
    (stringValues.length || 1);

  if (avgLength > 35 || avgWords > 4) {
    return 'text';
  }

  const uniqueSet = new Set(stringValues.map((v) => v.toLowerCase()));
  const uniqueRatio = uniqueSet.size / sampleSize;

  if (uniqueRatio <= 0.4 || (uniqueSet.size <= 20 && uniqueRatio <= 0.7 && avgLength < 25)) {
    return 'categorical';
  }

  return 'text';
}
