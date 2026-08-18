import { Router, Request, Response } from 'express';
import { generateDashboard } from '../engine/dashboardGenerator';

export const sampleRouter = Router();

const SAMPLES = [
  {
    id: 'vendas-globais',
    name: 'Vendas_Trimestre_2024.xlsx',
    type: 'xlsx' as const,
    description: 'Relatório comercial de vendas por região, produto e faturamento.',
    sizeBytes: 15420,
    records: [
      {
        Produto: 'Cloud ERP Pro',
        Categoria: 'Software',
        Regiao: 'Sudeste',
        Vendas: 145000,
        Quantidade: 45,
        Data: '2024-01-15',
      },
      {
        Produto: 'AI Analytics Suite',
        Categoria: 'Software',
        Regiao: 'Sul',
        Vendas: 98000,
        Quantidade: 28,
        Data: '2024-01-20',
      },
      {
        Produto: 'Consultoria DevSec',
        Categoria: 'Serviços',
        Regiao: 'Sudeste',
        Vendas: 65000,
        Quantidade: 12,
        Data: '2024-02-05',
      },
      {
        Produto: 'Servidor Baremetal X',
        Categoria: 'Hardware',
        Regiao: 'Nordeste',
        Vendas: 112000,
        Quantidade: 18,
        Data: '2024-02-14',
      },
      {
        Produto: 'Cloud ERP Pro',
        Categoria: 'Software',
        Regiao: 'Centro-Oeste',
        Vendas: 87000,
        Quantidade: 25,
        Data: '2024-02-28',
      },
      {
        Produto: 'Suporte 24/7 Enterprise',
        Categoria: 'Serviços',
        Regiao: 'Sudeste',
        Vendas: 45000,
        Quantidade: 50,
        Data: '2024-03-02',
      },
      {
        Produto: 'AI Analytics Suite',
        Categoria: 'Software',
        Regiao: 'Sudeste',
        Vendas: 135000,
        Quantidade: 36,
        Data: '2024-03-10',
      },
      {
        Produto: 'Firewall NGFW Ultra',
        Categoria: 'Hardware',
        Regiao: 'Sul',
        Vendas: 78000,
        Quantidade: 22,
        Data: '2024-03-18',
      },
      {
        Produto: 'Consultoria DevSec',
        Categoria: 'Serviços',
        Regiao: 'Nordeste',
        Vendas: 54000,
        Quantidade: 10,
        Data: '2024-03-25',
      },
      {
        Produto: 'Servidor Baremetal X',
        Categoria: 'Hardware',
        Regiao: 'Sudeste',
        Vendas: 168000,
        Quantidade: 30,
        Data: '2024-03-30',
      },
    ],
  },
  {
    id: 'rh-equipe',
    name: 'Quadro_Colaboradores.csv',
    type: 'csv' as const,
    description: 'Gestão de pessoas: departamentos, cargos, salários e avaliações.',
    sizeBytes: 8930,
    records: [
      {
        Colaborador: 'Ana Silva',
        Departamento: 'Engenharia',
        Cargo: 'Tech Lead',
        Salario: 18500,
        Score: 9.4,
        Status: 'Ativo',
      },
      {
        Colaborador: 'Bruno Souza',
        Departamento: 'Design',
        Cargo: 'Product Designer',
        Salario: 11200,
        Score: 8.9,
        Status: 'Ativo',
      },
      {
        Colaborador: 'Carla Dias',
        Departamento: 'Engenharia',
        Cargo: 'Senior Backend',
        Salario: 16000,
        Score: 9.1,
        Status: 'Ativo',
      },
      {
        Colaborador: 'Diego Lima',
        Departamento: 'Marketing',
        Cargo: 'Growth Manager',
        Salario: 13500,
        Score: 8.5,
        Status: 'Ativo',
      },
      {
        Colaborador: 'Elena Ramos',
        Departamento: 'Vendas',
        Cargo: 'Account Executive',
        Salario: 14000,
        Score: 9.7,
        Status: 'Ativo',
      },
      {
        Colaborador: 'Fabio Santos',
        Departamento: 'Engenharia',
        Cargo: 'Frontend Developer',
        Salario: 10500,
        Score: 8.8,
        Status: 'Ativo',
      },
      {
        Colaborador: 'Gabriela Melo',
        Departamento: 'Design',
        Cargo: 'UX Researcher',
        Salario: 9800,
        Score: 9.0,
        Status: 'Ativo',
      },
      {
        Colaborador: 'Henrique Vaz',
        Departamento: 'Vendas',
        Cargo: 'SDR',
        Salario: 6500,
        Score: 8.2,
        Status: 'Ativo',
      },
      {
        Colaborador: 'Isabela Cruz',
        Departamento: 'Engenharia',
        Cargo: 'DevOps Engineer',
        Salario: 15200,
        Score: 9.3,
        Status: 'Ativo',
      },
      {
        Colaborador: 'João Rocha',
        Departamento: 'Marketing',
        Cargo: 'Content Creator',
        Salario: 7800,
        Score: 8.6,
        Status: 'Ativo',
      },
    ],
  },
  {
    id: 'relatorio-executivo',
    name: 'Sumario_Executivo_Tech.docx',
    type: 'docx' as const,
    description: 'Documento Word com resumo textual e tabela de indicadores corporativos.',
    sizeBytes: 24300,
    records: [
      { Trimestre: 'Q1 2024', Receita: 1850000, Despesas: 1120000, ClientesNovos: 142, Churn: 1.2 },
      { Trimestre: 'Q2 2024', Receita: 2150000, Despesas: 1250000, ClientesNovos: 188, Churn: 0.9 },
      { Trimestre: 'Q3 2024', Receita: 2480000, Despesas: 1390000, ClientesNovos: 220, Churn: 0.8 },
      { Trimestre: 'Q4 2024', Receita: 2920000, Despesas: 1510000, ClientesNovos: 265, Churn: 0.6 },
    ],
    textSummary: {
      wordCount: 385,
      characterCount: 2640,
      paragraphsCount: 8,
      preview:
        'O ano fiscal de 2024 registrou expansão contínua em receita recorrente anual (ARR), impulsionada pela alta adesão das soluções empresariais em nuvem e inteligência artificial. A retenção líquida de receita superou as projeções operacionais em todos os trimestres.',
      extractedHeadings: [
        'Sumário Executivo 2024',
        'Desempenho Financeiro Consolidado',
        'Estratégia e Próximos Passos',
      ],
    },
  },
];

sampleRouter.get('/', (_req: Request, res: Response) => {
  const list = SAMPLES.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    description: s.description,
  }));
  res.json(list);
});

sampleRouter.get('/:id', (req: Request, res: Response): void => {
  const sample = SAMPLES.find((s) => s.id === req.params.id);
  if (!sample) {
    res.status(404).json({ error: 'Exemplo não encontrado.' });
    return;
  }

  const dashboard = generateDashboard(
    sample.name,
    sample.type,
    sample.sizeBytes,
    sample.records,
    sample.textSummary
  );

  res.json(dashboard);
});
