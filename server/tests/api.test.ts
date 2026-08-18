import request from 'supertest';
import { createApp } from '../src/app';

describe('API Integration', () => {
  const app = createApp();

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/samples returns sample list', async () => {
    const res = await request(app).get('/api/samples');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].id).toBeDefined();
  });

  it('GET /api/samples/:id returns generated dashboard', async () => {
    const res = await request(app).get('/api/samples/vendas-globais');
    expect(res.status).toBe(200);
    expect(res.body.document).toBeDefined();
    expect(res.body.summaryCards).toBeDefined();
    expect(res.body.charts).toBeDefined();
    expect(res.body.rawRecords).toBeDefined();
  });

  it('POST /api/upload returns 400 when no file is provided', async () => {
    const res = await request(app).post('/api/upload');
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/upload parses CSV file and returns dashboard payload', async () => {
    const csvBuffer = Buffer.from(
      'Cidade,Habitantes,RendaMedia\nCampinas,1200000,4500\nSantos,430000,4100\nSorocaba,690000,3800',
      'utf-8'
    );

    const res = await request(app).post('/api/upload').attach('file', csvBuffer, 'cidades.csv');

    expect(res.status).toBe(200);
    expect(res.body.document.name).toBe('cidades.csv');
    expect(res.body.document.type).toBe('csv');
    expect(res.body.document.totalRows).toBe(3);
    expect(res.body.summaryCards.length).toBeGreaterThan(0);
    expect(res.body.charts.length).toBeGreaterThan(0);
  });
});
