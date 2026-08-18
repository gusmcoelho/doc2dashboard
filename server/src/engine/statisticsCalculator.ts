import { ColumnMeta, CategoryFrequency } from '../types';
import { detectColumnType, parseNumberValue, parseDateValue } from './typeDetector';

export function calculateColumnMeta(
  records: Array<Record<string, any>>,
  columnName: string
): ColumnMeta {
  const values = records.map((r) => r[columnName]);
  const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== '');
  const totalCount = records.length;
  const nullCount = totalCount - nonNullValues.length;
  const type = detectColumnType(values, columnName);

  const uniqueSet = new Set(nonNullValues.map((v) => String(v).trim()));
  const uniqueCount = uniqueSet.size;

  const meta: ColumnMeta = {
    name: columnName,
    type,
    totalCount,
    nullCount,
    uniqueCount,
  };

  if (type === 'numeric') {
    const numbers = nonNullValues.map(parseNumberValue).filter((n): n is number => n !== null);

    if (numbers.length > 0) {
      numbers.sort((a, b) => a - b);
      const sum = numbers.reduce((acc, val) => acc + val, 0);
      const avg = Number((sum / numbers.length).toFixed(2));
      const min = numbers[0];
      const max = numbers[numbers.length - 1];

      let median: number;
      const mid = Math.floor(numbers.length / 2);
      if (numbers.length % 2 === 0) {
        median = Number(((numbers[mid - 1] + numbers[mid]) / 2).toFixed(2));
      } else {
        median = numbers[mid];
      }

      meta.sum = Number(sum.toFixed(2));
      meta.avg = avg;
      meta.min = min;
      meta.max = max;
      meta.median = median;
    }
  } else if (type === 'date') {
    const dates = nonNullValues.map(parseDateValue).filter((d): d is Date => d !== null);

    if (dates.length > 0) {
      dates.sort((a, b) => a.getTime() - b.getTime());
      meta.min = dates[0].toISOString().split('T')[0];
      meta.max = dates[dates.length - 1].toISOString().split('T')[0];
    }
  }

  if (type === 'categorical' || type === 'boolean' || uniqueCount <= 20) {
    const frequencyMap = new Map<string, number>();
    for (const val of nonNullValues) {
      const key = String(val).trim();
      frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
    }

    const sortedCategories: CategoryFrequency[] = Array.from(frequencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({
        category,
        count,
        percentage: Number(((count / (nonNullValues.length || 1)) * 100).toFixed(1)),
      }));

    meta.topCategories = sortedCategories;
  }

  return meta;
}

export function analyzeDataset(records: Array<Record<string, any>>): {
  columns: ColumnMeta[];
  normalizedRecords: Array<Record<string, any>>;
} {
  if (!records || records.length === 0) {
    return { columns: [], normalizedRecords: [] };
  }

  const columnNames = Object.keys(records[0]);
  const columns = columnNames.map((name) => calculateColumnMeta(records, name));

  const numericColumnNames = new Set(
    columns.filter((c) => c.type === 'numeric').map((c) => c.name)
  );

  const normalizedRecords = records.map((record) => {
    const copy: Record<string, any> = { ...record };
    for (const col of numericColumnNames) {
      const parsed = parseNumberValue(copy[col]);
      if (parsed !== null) {
        copy[col] = parsed;
      }
    }
    return copy;
  });

  return { columns, normalizedRecords };
}
