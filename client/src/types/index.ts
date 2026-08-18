export type SupportedFileType = 'xlsx' | 'xls' | 'csv' | 'docx' | 'pdf';

export type ColumnDataType = 'numeric' | 'categorical' | 'date' | 'text' | 'boolean' | 'id';

export interface CategoryFrequency {
  category: string;
  count: number;
  percentage: number;
}

export interface ColumnMeta {
  name: string;
  type: ColumnDataType;
  totalCount: number;
  nullCount: number;
  uniqueCount: number;
  min?: number | string;
  max?: number | string;
  sum?: number;
  avg?: number;
  median?: number;
  topCategories?: CategoryFrequency[];
}

export interface SummaryCard {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  type: 'metric' | 'count' | 'average' | 'total' | 'highlight' | 'dateRange';
  icon?: string;
}

export interface ChartConfig {
  id: string;
  title: string;
  type: 'bar' | 'pie' | 'line' | 'area';
  xAxisKey: string;
  yAxisKeys: string[];
  data: Array<Record<string, any>>;
  description?: string;
}

export interface DocumentTextSummary {
  wordCount: number;
  characterCount: number;
  paragraphsCount: number;
  preview: string;
  extractedHeadings?: string[];
}

export interface DashboardPayload {
  document: {
    name: string;
    type: SupportedFileType;
    sizeBytes: number;
    totalRows: number;
    totalColumns: number;
    availableSheets?: string[];
  };
  columns: ColumnMeta[];
  summaryCards: SummaryCard[];
  charts: ChartConfig[];
  rawRecords: Array<Record<string, any>>;
  textSummary?: DocumentTextSummary;
}

export interface SampleItem {
  id: string;
  name: string;
  type: SupportedFileType;
  description: string;
}
