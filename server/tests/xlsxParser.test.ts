import * as XLSX from 'xlsx';
import { parseXlsxBuffer } from '../src/parsers/xlsxParser';

describe('xlsxParser', () => {
  it('should parse xlsx buffer with multiple sheets', () => {
    const workbook = XLSX.utils.book_new();

    const sheet1Data = [
      { Produto: 'Notebook', Preco: 4500, Qtd: 10 },
      { Produto: 'Mouse', Preco: 120, Qtd: 50 },
    ];
    const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
    XLSX.utils.book_append_sheet(workbook, ws1, 'Vendas');

    const sheet2Data = [
      { Despesa: 'Aluguel', Valor: 3000 },
      { Despesa: 'Energia', Valor: 800 },
    ];
    const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
    XLSX.utils.book_append_sheet(workbook, ws2, 'Despesas');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const result = parseXlsxBuffer(buffer, 'financeiro.xlsx');
    expect(result.fileType).toBe('xlsx');
    expect(result.availableSheets).toEqual(['Vendas', 'Despesas']);
    expect(result.activeSheet).toBe('Vendas');
    expect(result.records.length).toBe(2);
    expect(result.records[0].Produto).toBe('Notebook');

    const resultSheet2 = parseXlsxBuffer(buffer, 'financeiro.xlsx', 'Despesas');
    expect(resultSheet2.activeSheet).toBe('Despesas');
    expect(resultSheet2.records.length).toBe(2);
    expect(resultSheet2.records[0].Despesa).toBe('Aluguel');
  });

  it('should parse csv buffer', () => {
    const csvContent = 'Nome,Departamento,Salario\nLucas,TI,9000\nMariana,RH,7500\n';
    const buffer = Buffer.from(csvContent, 'utf-8');

    const result = parseXlsxBuffer(buffer, 'colaboradores.csv');
    expect(result.fileType).toBe('csv');
    expect(result.records.length).toBe(2);
    expect(result.records[0].Nome).toBe('Lucas');
  });
});
