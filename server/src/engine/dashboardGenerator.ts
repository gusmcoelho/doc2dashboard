import {
  DashboardPayload,
  DocumentTextSummary,
  SummaryCard,
  ChartConfig,
  SupportedFileType,
  ColumnMeta,
} from '../types';
import { analyzeDataset } from './statisticsCalculator';

function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function selectPrimaryNumericColumn(columns: ColumnMeta[]): ColumnMeta | undefined {
  const numericCols = columns.filter((c) => c.type === 'numeric' && c.sum !== undefined);
  if (numericCols.length === 0) return undefined;

  const priorityKeywords = [
    'total',
    'receita',
    'revenue',
    'faturamento',
    'venda',
    'sales',
    'salario',
    'salary',
    'valor',
    'price',
    'preco',
    'amount',
    'lucro',
    'profit',
    'custo',
    'cost',
    'score',
    'pontuacao',
    'quantidade',
    'quantity',
    'qtd',
  ];

  for (const keyword of priorityKeywords) {
    const match = numericCols.find((c) => normalizeStr(c.name).includes(keyword));
    if (match) return match;
  }

  return numericCols[0];
}

function selectPrimaryCategoricalColumn(columns: ColumnMeta[]): ColumnMeta | undefined {
  const categoricalCols = columns.filter(
    (c) => (c.type === 'categorical' || c.type === 'text') && (c.topCategories?.length || 0) > 1
  );

  if (categoricalCols.length === 0) {
    return columns.find((c) => c.type === 'categorical');
  }

  const priorityKeywords = [
    'regiao',
    'region',
    'departamento',
    'department',
    'produto',
    'product',
    'categoria',
    'category',
    'setor',
    'cliente',
    'segmento',
    'cidade',
    'city',
    'estado',
    'pais',
    'country',
    'tipo',
    'type',
    'mes',
    'month',
    'status',
  ];

  for (const keyword of priorityKeywords) {
    const match = categoricalCols.find((c) => normalizeStr(c.name).includes(keyword));
    if (match) return match;
  }

  return categoricalCols.sort(
    (a, b) => (b.topCategories?.length || 0) - (a.topCategories?.length || 0)
  )[0];
}

function selectDateColumn(columns: ColumnMeta[]): ColumnMeta | undefined {
  return columns.find((c) => c.type === 'date');
}

export function generateDashboard(
  fileName: string,
  fileType: SupportedFileType,
  fileSizeBytes: number,
  records: Array<Record<string, any>>,
  textSummary?: DocumentTextSummary,
  availableSheets?: string[]
): DashboardPayload {
  const { columns, normalizedRecords } = analyzeDataset(records);
  const totalRows = normalizedRecords.length;
  const totalColumns = columns.length;

  const summaryCards: SummaryCard[] = [];

  summaryCards.push({
    id: 'total-records',
    title: 'Total de Registros',
    value: totalRows.toLocaleString('pt-BR'),
    subtitle: `${totalColumns} colunas identificadas`,
    type: 'count',
  });

  const primaryNumeric = selectPrimaryNumericColumn(columns);
  const primaryCategorical = selectPrimaryCategoricalColumn(columns);
  const dateCol = selectDateColumn(columns);

  if (primaryNumeric && primaryNumeric.sum !== undefined) {
    const isCurrency =
      primaryNumeric.name.toLowerCase().includes('valor') ||
      primaryNumeric.name.toLowerCase().includes('receita') ||
      primaryNumeric.name.toLowerCase().includes('faturamento') ||
      primaryNumeric.name.toLowerCase().includes('preco') ||
      primaryNumeric.name.toLowerCase().includes('salario');

    const formattedSum = isCurrency
      ? `R$ ${primaryNumeric.sum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : primaryNumeric.sum.toLocaleString('pt-BR');

    summaryCards.push({
      id: 'metric-sum',
      title: primaryNumeric.name,
      value: formattedSum,
      subtitle: `Soma total (Mín: ${primaryNumeric.min?.toLocaleString('pt-BR')} | Máx: ${primaryNumeric.max?.toLocaleString('pt-BR')})`,
      type: 'total',
    });

    if (primaryNumeric.avg !== undefined) {
      const formattedAvg = isCurrency
        ? `R$ ${primaryNumeric.avg.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : primaryNumeric.avg.toLocaleString('pt-BR');

      summaryCards.push({
        id: 'metric-avg',
        title: primaryNumeric.name,
        value: formattedAvg,
        subtitle: `Média por registro (Mediana: ${primaryNumeric.median?.toLocaleString('pt-BR')})`,
        type: 'average',
      });
    }
  }

  if (
    primaryCategorical &&
    primaryCategorical.topCategories &&
    primaryCategorical.topCategories.length > 0
  ) {
    const top = primaryCategorical.topCategories[0];
    summaryCards.push({
      id: 'top-category',
      title: primaryCategorical.name,
      value: top.category || 'N/A',
      subtitle: `Mais frequente: ${top.count} ocorrências (${top.percentage}%)`,
      type: 'highlight',
    });
  }

  if (dateCol && dateCol.min && dateCol.max) {
    summaryCards.push({
      id: 'date-span',
      title: dateCol.name,
      value: `${dateCol.min} até ${dateCol.max}`,
      subtitle: `Intervalo com ${dateCol.uniqueCount} datas distintas`,
      type: 'dateRange',
    });
  } else if (columns.length > 1) {
    const numericCols = columns.filter(
      (c) => c.type === 'numeric' && c.name !== primaryNumeric?.name
    );
    if (numericCols.length > 0 && numericCols[0].avg !== undefined) {
      const secondary = numericCols[0];
      summaryCards.push({
        id: 'secondary-metric',
        title: secondary.name,
        value: secondary.avg?.toLocaleString('pt-BR') ?? '0',
        subtitle: `Média por registro (Soma: ${secondary.sum?.toLocaleString('pt-BR')})`,
        type: 'metric',
      });
    }
  }

  const charts: ChartConfig[] = [];

  if (primaryCategorical && primaryNumeric && normalizedRecords.length > 0) {
    const aggregation = new Map<string, { sum: number; count: number }>();
    for (const record of normalizedRecords) {
      const catKey = String(record[primaryCategorical.name] ?? 'Outros').trim() || 'N/A';
      const numVal =
        typeof record[primaryNumeric.name] === 'number' ? record[primaryNumeric.name] : 0;
      const current = aggregation.get(catKey) || { sum: 0, count: 0 };
      aggregation.set(catKey, {
        sum: current.sum + numVal,
        count: current.count + 1,
      });
    }

    const sortedAgg = Array.from(aggregation.entries())
      .sort((a, b) => b[1].sum - a[1].sum)
      .slice(0, 10)
      .map(([cat, data]) => ({
        [primaryCategorical.name]: cat,
        [primaryNumeric.name]: Number(data.sum.toFixed(2)),
        media: Number((data.sum / (data.count || 1)).toFixed(2)),
        quantidade: data.count,
      }));

    charts.push({
      id: 'bar-category-metric',
      title: `${primaryNumeric.name} por ${primaryCategorical.name}`,
      type: 'bar',
      xAxisKey: primaryCategorical.name,
      yAxisKeys: [primaryNumeric.name],
      data: sortedAgg,
      description: `Comparativo de ${primaryNumeric.name} agrupado por ${primaryCategorical.name}`,
    });
  } else if (
    primaryCategorical &&
    primaryCategorical.topCategories &&
    primaryCategorical.topCategories.length > 0
  ) {
    const barData = primaryCategorical.topCategories.slice(0, 10).map((c) => ({
      [primaryCategorical.name]: c.category,
      Contagem: c.count,
    }));

    charts.push({
      id: 'bar-category-counts',
      title: primaryCategorical.name,
      type: 'bar',
      xAxisKey: primaryCategorical.name,
      yAxisKeys: ['Contagem'],
      data: barData,
      description: `Frequência de registros por ${primaryCategorical.name}`,
    });
  }

  const pieCategorical =
    columns.find(
      (c) =>
        (c.type === 'categorical' || c.type === 'boolean') &&
        (c.topCategories?.length || 0) >= 2 &&
        (c.topCategories?.length || 0) <= 8 &&
        c.name !== primaryCategorical?.name
    ) || primaryCategorical;

  if (pieCategorical && pieCategorical.topCategories && pieCategorical.topCategories.length >= 2) {
    const pieData = pieCategorical.topCategories.slice(0, 6).map((item) => ({
      name: item.category || 'N/A',
      value: item.count,
      percentage: item.percentage,
    }));

    if (pieCategorical.topCategories.length > 6) {
      const remainingCount = pieCategorical.topCategories
        .slice(6)
        .reduce((sum, item) => sum + item.count, 0);
      const remainingPct = pieCategorical.topCategories
        .slice(6)
        .reduce((sum, item) => sum + item.percentage, 0);
      pieData.push({
        name: 'Outros',
        value: remainingCount,
        percentage: Number(remainingPct.toFixed(1)),
      });
    }

    charts.push({
      id: 'pie-distribution',
      title: pieCategorical.name,
      type: 'pie',
      xAxisKey: 'name',
      yAxisKeys: ['value'],
      data: pieData,
      description: `Participação percentual por ${pieCategorical.name}`,
    });
  }

  if (dateCol && primaryNumeric && normalizedRecords.length > 0) {
    const dateMap = new Map<string, { sum: number; count: number }>();
    for (const record of normalizedRecords) {
      const dateVal = String(record[dateCol.name] ?? '').split('T')[0];
      if (!dateVal) continue;
      const numVal =
        typeof record[primaryNumeric.name] === 'number' ? record[primaryNumeric.name] : 0;
      const cur = dateMap.get(dateVal) || { sum: 0, count: 0 };
      dateMap.set(dateVal, {
        sum: cur.sum + numVal,
        count: cur.count + 1,
      });
    }

    const sortedDateData = Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(0, 30)
      .map(([dateKey, stats]) => ({
        [dateCol.name]: dateKey,
        [primaryNumeric.name]: Number(stats.sum.toFixed(2)),
      }));

    if (sortedDateData.length > 1) {
      charts.push({
        id: 'line-temporal-trend',
        title: `${primaryNumeric.name} por ${dateCol.name}`,
        type: 'line',
        xAxisKey: dateCol.name,
        yAxisKeys: [primaryNumeric.name],
        data: sortedDateData,
        description: `Evolução de ${primaryNumeric.name} ao longo de ${dateCol.name}`,
      });
    }
  } else if (primaryNumeric && normalizedRecords.length > 0) {
    const sampleTrend = normalizedRecords.slice(0, 25).map((row, idx) => {
      const label = primaryCategorical
        ? String(row[primaryCategorical.name] || `#${idx + 1}`)
        : `#${idx + 1}`;
      return {
        item: label,
        [primaryNumeric.name]: row[primaryNumeric.name] ?? 0,
      };
    });

    if (sampleTrend.length > 1) {
      charts.push({
        id: 'area-sequence-trend',
        title: `${primaryNumeric.name} (Sequencial)`,
        type: 'area',
        xAxisKey: 'item',
        yAxisKeys: [primaryNumeric.name],
        data: sampleTrend,
        description: `Visualização sequencial dos registros para ${primaryNumeric.name}`,
      });
    }
  }

  return {
    document: {
      name: fileName,
      type: fileType,
      sizeBytes: fileSizeBytes,
      totalRows,
      totalColumns,
      availableSheets,
    },
    columns,
    summaryCards,
    charts,
    rawRecords: normalizedRecords,
    textSummary,
  };
}
