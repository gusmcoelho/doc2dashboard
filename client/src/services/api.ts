import { DashboardPayload, SampleItem } from '../types';

const API_BASE_URL = '/api';

export async function uploadDocument(file: File, sheet?: string): Promise<DashboardPayload> {
  const formData = new FormData();
  formData.append('file', file);

  const url = sheet
    ? `${API_BASE_URL}/upload?sheet=${encodeURIComponent(sheet)}`
    : `${API_BASE_URL}/upload`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro ${response.status}: Falha no upload.`);
  }

  return response.json();
}

export async function getSamples(): Promise<SampleItem[]> {
  const response = await fetch(`${API_BASE_URL}/samples`);
  if (!response.ok) {
    throw new Error('Falha ao carregar lista de exemplos.');
  }
  return response.json();
}

export async function loadSample(sampleId: string): Promise<DashboardPayload> {
  const response = await fetch(`${API_BASE_URL}/samples/${encodeURIComponent(sampleId)}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao carregar exemplo.');
  }
  return response.json();
}
