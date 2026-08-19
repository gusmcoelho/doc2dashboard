import request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { createApp } from '../src/app';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

describe('E2E Functional Audit', () => {
  const app = createApp();

  it('1. should upload .csv and generate dashboard with exact dynamic column titles', async () => {
    const csvPath = path.join(FIXTURES_DIR, 'vendas_regionais.csv');
    const res = await request(app).post('/api/upload').attach('file', csvPath);

    expect(res.status).toBe(200);
    expect(res.body.document.type).toBe('csv');
    expect(res.body.document.totalRows).toBe(8);

    const totalCard = res.body.summaryCards.find((c: any) => c.type === 'total');
    expect(totalCard?.title).toBe('Valor Total (R$)');

    const highlightCard = res.body.summaryCards.find((c: any) => c.type === 'highlight');
    expect(highlightCard?.title).toBe('Região de Venda');

    const barChart = res.body.charts.find((c: any) => c.type === 'bar');
    expect(barChart?.title).toBe('Valor Total (R$) por Região de Venda');

    expect(res.body.rawRecords.length).toBe(8);
  });

  it('2. should upload .xlsx and generate dashboard with exact dynamic column titles', async () => {
    const xlsxPath = path.join(FIXTURES_DIR, 'folha_pagamento.xlsx');
    const res = await request(app).post('/api/upload').attach('file', xlsxPath);

    expect(res.status).toBe(200);
    expect(res.body.document.type).toBe('xlsx');
    expect(res.body.document.totalRows).toBe(5);

    const totalCard = res.body.summaryCards.find((c: any) => c.type === 'total');
    expect(totalCard?.title).toBe('Salário Base (R$)');

    const barChart = res.body.charts.find((c: any) => c.type === 'bar');
    expect(barChart?.title).toBe('Salário Base (R$) por Departamento Operacional');
  });

  it('3. should handle docx document with internal table', async () => {
    const res = await request(app).get('/api/samples/relatorio-executivo');
    expect(res.status).toBe(200);
    expect(res.body.document.type).toBe('docx');
    expect(res.body.rawRecords.length).toBeGreaterThan(0);
    expect(res.body.textSummary).toBeDefined();
  });

  it('4. should handle text-only document without crashing', async () => {
    const textOnlyBuffer = Buffer.from(
      'Este é um documento puramente textual.\nContém parágrafos de análise estratégica e metas.\nNão possui tabelas estruturadas.',
      'utf-8'
    );

    const res = await request(app)
      .post('/api/upload')
      .attach('file', textOnlyBuffer, 'comunicado.pdf');

    expect(res.status).toBe(200);
    expect(res.body.document.type).toBe('pdf');
    expect(res.body.textSummary).toBeDefined();
    expect(res.body.textSummary.wordCount).toBeGreaterThan(0);
    expect(res.body.summaryCards.length).toBeGreaterThan(0);
  });

  it('5. should gracefully handle empty file without crashing', async () => {
    const emptyPath = path.join(FIXTURES_DIR, 'arquivo_vazio.csv');
    const res = await request(app).post('/api/upload').attach('file', emptyPath);

    expect([200, 400]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.document.totalRows).toBe(0);
    }
  });

  it('6. should gracefully return error for corrupted file without crashing', async () => {
    const corruptPath = path.join(FIXTURES_DIR, 'corrompido.pdf');
    const res = await request(app).post('/api/upload').attach('file', corruptPath);

    expect([400, 500]).toContain(res.status);
    expect(res.body.error).toBeDefined();
  });
});
