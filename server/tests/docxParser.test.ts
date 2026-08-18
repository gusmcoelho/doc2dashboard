import * as mammoth from 'mammoth';
import { parseDocxBuffer } from '../src/parsers/docxParser';

jest.mock('mammoth');

describe('docxParser', () => {
  const mockedMammoth = mammoth as jest.Mocked<typeof mammoth>;

  it('should parse docx with embedded HTML table and headings', async () => {
    mockedMammoth.convertToHtml.mockResolvedValueOnce({
      value: `
        <h1>Relatório de Desempenho</h1>
        <p>Abaixo estão os indicadores operacionais da equipe.</p>
        <table>
          <tr><th>Setor</th><th>Faturamento</th><th>MetasAtingidas</th></tr>
          <tr><td>Sul</td><td>120000</td><td>15</td></tr>
          <tr><td>Norte</td><td>95000</td><td>12</td></tr>
        </table>
      `,
      messages: [],
    });

    mockedMammoth.extractRawText.mockResolvedValueOnce({
      value: 'Relatório de Desempenho\n\nAbaixo estão os indicadores operacionais da equipe.',
      messages: [],
    });

    const buffer = Buffer.from('dummy-docx-content');
    const result = await parseDocxBuffer(buffer, 'desempenho.docx');

    expect(result.fileType).toBe('docx');
    expect(result.records.length).toBe(2);
    expect(result.records[0].Setor).toBe('Sul');
    expect(result.records[0].Faturamento).toBe('120000');
    expect(result.textSummary.extractedHeadings).toEqual(['Relatório de Desempenho']);
    expect(result.textSummary.wordCount).toBeGreaterThan(0);
  });

  it('should fallback to key-value extraction when no table is present', async () => {
    mockedMammoth.convertToHtml.mockResolvedValueOnce({
      value: '<p>Empresa: Tech Corp</p><p>Total Clientes: 1500</p><p>NPS: 88</p>',
      messages: [],
    });

    mockedMammoth.extractRawText.mockResolvedValueOnce({
      value: 'Empresa: Tech Corp\nTotal Clientes: 1500\nNPS: 88',
      messages: [],
    });

    const buffer = Buffer.from('dummy-docx-content');
    const result = await parseDocxBuffer(buffer, 'sumario.docx');

    expect(result.records.length).toBe(3);
    expect(result.records[0].Item).toBe('Empresa');
    expect(result.records[0].Valor).toBe('Tech Corp');
  });
});
