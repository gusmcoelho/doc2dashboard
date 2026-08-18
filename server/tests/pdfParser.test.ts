import pdfParse from 'pdf-parse';
import { parsePdfBuffer } from '../src/parsers/pdfParser';

jest.mock('pdf-parse');

describe('pdfParser', () => {
  const mockedPdfParse = pdfParse as jest.MockedFunction<typeof pdfParse>;

  it('should parse tabular text lines from PDF', async () => {
    mockedPdfParse.mockResolvedValueOnce({
      text: 'Filial | Faturamento | Clientes\nMatriz | 500000 | 1200\nFilial SP | 350000 | 850\nFilial RJ | 220000 | 450',
      numpages: 1,
      numrender: 1,
      info: {},
      metadata: null,
      version: 'v1.10.100',
    });

    const buffer = Buffer.from('dummy-pdf-content');
    const result = await parsePdfBuffer(buffer, 'faturamento.pdf');

    expect(result.fileType).toBe('pdf');
    expect(result.records.length).toBe(3);
    expect(result.records[0].Filial).toBe('Matriz');
    expect(result.records[0].Faturamento).toBe('500000');
    expect(result.textSummary.wordCount).toBeGreaterThan(0);
  });

  it('should fallback to paragraph extraction if no table is found', async () => {
    mockedPdfParse.mockResolvedValueOnce({
      text: 'Parágrafo inicial com descrição do projeto.\nSegunda seção com metas e prazos estipulados.',
      numpages: 1,
      numrender: 1,
      info: {},
      metadata: null,
      version: 'v1.10.100',
    });

    const buffer = Buffer.from('dummy-pdf-content');
    const result = await parsePdfBuffer(buffer, 'documento.pdf');

    expect(result.records.length).toBe(2);
    expect(result.records[0].Linha).toBe(1);
    expect(result.records[0].Palavras).toBeGreaterThan(0);
  });
});
