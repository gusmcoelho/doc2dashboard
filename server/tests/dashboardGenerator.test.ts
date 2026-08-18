import { generateDashboard } from '../src/engine/dashboardGenerator';

describe('dashboardGenerator', () => {
  const records = [
    { Regiao: 'Sudeste', Vendas: 120000, Clientes: 45, Data: '2024-01-10' },
    { Regiao: 'Sul', Vendas: 85000, Clientes: 30, Data: '2024-01-15' },
    { Regiao: 'Nordeste', Vendas: 95000, Clientes: 35, Data: '2024-01-20' },
    { Regiao: 'Sudeste', Vendas: 140000, Clientes: 50, Data: '2024-01-25' },
  ];

  it('should generate summary cards, charts and document metadata', () => {
    const dashboard = generateDashboard('vendas.xlsx', 'xlsx', 10240, records);

    expect(dashboard.document.name).toBe('vendas.xlsx');
    expect(dashboard.document.type).toBe('xlsx');
    expect(dashboard.document.totalRows).toBe(4);
    expect(dashboard.document.totalColumns).toBe(4);

    expect(dashboard.summaryCards.length).toBeGreaterThanOrEqual(3);
    const countCard = dashboard.summaryCards.find((c) => c.type === 'count');
    expect(countCard).toBeDefined();
    expect(countCard?.value).toBe('4');

    expect(dashboard.charts.length).toBeGreaterThanOrEqual(2);
    const barChart = dashboard.charts.find((c) => c.type === 'bar');
    expect(barChart).toBeDefined();
    expect(barChart?.data.length).toBeGreaterThan(0);

    expect(dashboard.rawRecords.length).toBe(4);
  });

  it('should include text summary when provided', () => {
    const textSummary = {
      wordCount: 150,
      characterCount: 900,
      paragraphsCount: 3,
      preview: 'Resumo executivo do projeto',
      extractedHeadings: ['Visão Geral'],
    };

    const dashboard = generateDashboard(
      'relatorio.docx',
      'docx',
      20480,
      [{ Secao: '1', Score: 95 }],
      textSummary
    );

    expect(dashboard.textSummary).toBeDefined();
    expect(dashboard.textSummary?.wordCount).toBe(150);
  });
});
