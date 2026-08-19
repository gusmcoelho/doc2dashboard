import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
if (!fs.existsSync(FIXTURES_DIR)) {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
}

// 1. CSV test file with exact custom column names
const csvContent = `Região de Venda,Valor Total (R$),Quantidade,Status,Data da Venda
Sudeste,145000.50,45,Concluído,2024-01-15
Sul,98000.00,28,Concluído,2024-01-20
Nordeste,65000.75,18,Pendente,2024-02-05
Centro-Oeste,87000.00,25,Concluído,2024-02-14
Sudeste,135000.20,36,Concluído,2024-03-02
Sul,78000.00,22,Pendente,2024-03-18
Nordeste,54000.00,10,Concluído,2024-03-25
Sudeste,168000.00,30,Concluído,2024-03-30`;

fs.writeFileSync(path.join(FIXTURES_DIR, 'vendas_regionais.csv'), csvContent, 'utf-8');

// 2. XLSX test file with custom column names
const wb = XLSX.utils.book_new();
const xlsxRows = [
  {
    'Departamento Operacional': 'Engenharia',
    'Salário Base (R$)': 18500,
    'Score de Performance': 9.4,
    Colaboradores: 15,
  },
  {
    'Departamento Operacional': 'Design & UX',
    'Salário Base (R$)': 11200,
    'Score de Performance': 8.9,
    Colaboradores: 8,
  },
  {
    'Departamento Operacional': 'Marketing',
    'Salário Base (R$)': 13500,
    'Score de Performance': 8.5,
    Colaboradores: 12,
  },
  {
    'Departamento Operacional': 'Comercial & Vendas',
    'Salário Base (R$)': 14000,
    'Score de Performance': 9.7,
    Colaboradores: 20,
  },
  {
    'Departamento Operacional': 'Operações & Cloud',
    'Salário Base (R$)': 16000,
    'Score de Performance': 9.1,
    Colaboradores: 10,
  },
];
const ws = XLSX.utils.json_to_sheet(xlsxRows);
XLSX.utils.book_append_sheet(wb, ws, 'Geral');
XLSX.writeFile(wb, path.join(FIXTURES_DIR, 'folha_pagamento.xlsx'));

// 3. Empty file
fs.writeFileSync(path.join(FIXTURES_DIR, 'arquivo_vazio.csv'), '', 'utf-8');

// 4. Corrupted file
fs.writeFileSync(
  path.join(FIXTURES_DIR, 'corrompido.pdf'),
  Buffer.from([0x00, 0x01, 0x02, 0x03, 0xff]),
  'binary'
);

console.log('Fixtures generated successfully in', FIXTURES_DIR);
