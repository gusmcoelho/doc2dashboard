import { calculateColumnMeta, analyzeDataset } from '../src/engine/statisticsCalculator';

describe('statisticsCalculator', () => {
  const sampleRecords = [
    { Produto: 'Teclado', Categoria: 'Hardware', Preco: 150, Quantidade: 10, Data: '2024-01-10' },
    { Produto: 'Mouse', Categoria: 'Hardware', Preco: 80, Quantidade: 25, Data: '2024-01-12' },
    { Produto: 'Monitor', Categoria: 'Hardware', Preco: 1200, Quantidade: 5, Data: '2024-01-15' },
    { Produto: 'Antivirus', Categoria: 'Software', Preco: 120, Quantidade: 40, Data: '2024-01-18' },
    { Produto: 'IDE Pro', Categoria: 'Software', Preco: 350, Quantidade: 20, Data: '2024-01-20' },
  ];

  it('should calculate numeric column statistics properly', () => {
    const meta = calculateColumnMeta(sampleRecords, 'Preco');
    expect(meta.type).toBe('numeric');
    expect(meta.totalCount).toBe(5);
    expect(meta.nullCount).toBe(0);
    expect(meta.min).toBe(80);
    expect(meta.max).toBe(1200);
    expect(meta.sum).toBe(1900);
    expect(meta.avg).toBe(380);
    expect(meta.median).toBe(150);
  });

  it('should calculate categorical column frequencies', () => {
    const meta = calculateColumnMeta(sampleRecords, 'Categoria');
    expect(meta.type).toBe('categorical');
    expect(meta.topCategories).toBeDefined();
    expect(meta.topCategories?.length).toBe(2);

    const hardware = meta.topCategories?.find((c) => c.category === 'Hardware');
    expect(hardware?.count).toBe(3);
    expect(hardware?.percentage).toBe(60);

    const software = meta.topCategories?.find((c) => c.category === 'Software');
    expect(software?.count).toBe(2);
    expect(software?.percentage).toBe(40);
  });

  it('should calculate date column range', () => {
    const meta = calculateColumnMeta(sampleRecords, 'Data');
    expect(meta.type).toBe('date');
    expect(meta.min).toBe('2024-01-10');
    expect(meta.max).toBe('2024-01-20');
  });

  it('should analyze complete dataset and normalize numeric columns', () => {
    const { columns, normalizedRecords } = analyzeDataset(sampleRecords);
    expect(columns.length).toBe(5);
    expect(normalizedRecords.length).toBe(5);
    expect(typeof normalizedRecords[0].Preco).toBe('number');
    expect(typeof normalizedRecords[0].Quantidade).toBe('number');
  });
});
