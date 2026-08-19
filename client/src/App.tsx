import React, { useState, useEffect } from 'react';
import { DashboardPayload, SampleItem } from './types';
import { uploadDocument, getSamples, loadSample } from './services/api';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { SampleSelector } from './components/SampleSelector';
import { SummaryCards } from './components/SummaryCards';
import { ChartSection } from './components/ChartSection';
import { TextInsights } from './components/TextInsights';
import { DataTable } from './components/DataTable';
import { FileSpreadsheet, FileText, FileCode, AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [samples, setSamples] = useState<SampleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  useEffect(() => {
    getSamples()
      .then(setSamples)
      .catch(() => {});
  }, []);

  const handleFileUpload = async (file: File, sheet?: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentFile(file);

    try {
      const data = await uploadDocument(file, sheet);
      setDashboard(data);
    } catch (err: any) {
      setError(err?.message || 'Falha ao processar o arquivo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = async (sampleId: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentFile(null);

    try {
      const data = await loadSample(sampleId);
      setDashboard(data);
    } catch (err: any) {
      setError(err?.message || 'Falha ao carregar exemplo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSheetChange = (newSheet: string) => {
    if (currentFile) {
      handleFileUpload(currentFile, newSheet);
    }
  };

  const handleExportCsv = () => {
    if (!dashboard || dashboard.rawRecords.length === 0) return;

    const headers = dashboard.columns.map((c) => c.name);
    const csvRows: string[] = [headers.join(',')];

    for (const record of dashboard.rawRecords) {
      const row = headers.map((header) => {
        const val = record[header];
        const stringVal = val === null || val === undefined ? '' : String(val);
        return `"${stringVal.replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    }

    const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(csvBlob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute(
      'download',
      `${dashboard.document.name.replace(/\.[^/.]+$/, '')}_export.csv`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleReset = () => {
    setDashboard(null);
    setError(null);
    setCurrentFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderFileIcon = (type: string) => {
    switch (type) {
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet size={22} />;
      case 'csv':
        return <FileCode size={22} />;
      default:
        return <FileText size={22} />;
    }
  };

  return (
    <div className="app-container">
      <Header
        dashboard={dashboard}
        onReset={handleReset}
        onExportCsv={dashboard ? handleExportCsv : undefined}
      />

      <main className="main-content">
        {error && (
          <div className="error-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="btn btn-ghost"
              style={{ padding: '0.2rem 0.5rem', color: '#fca5a5' }}
            >
              Fechar
            </button>
          </div>
        )}

        {!dashboard ? (
          <div>
            <div className="hero-section">
              <h1 className="hero-title">
                Transforme qualquer documento em um{' '}
                <span className="highlight">Dashboard Visual</span>
              </h1>
              <p className="hero-subtitle">
                Faça upload de planilhas Excel, CSVs, documentos Word ou PDFs e gere automaticamente
                gráficos interativos, cartões de KPIs e estatísticas tratadas.
              </p>
            </div>

            <UploadZone onFileUpload={(file) => handleFileUpload(file)} isLoading={isLoading} />

            <SampleSelector
              samples={samples}
              onSelectSample={handleSelectSample}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div>
            <div className="dashboard-meta-bar">
              <div className="document-badge-group">
                <div className="document-icon-box">{renderFileIcon(dashboard.document.type)}</div>
                <div>
                  <div className="document-info-title">{dashboard.document.name}</div>
                  <div className="document-info-meta">
                    <span>{dashboard.document.type.toUpperCase()}</span>
                    <span>•</span>
                    <span>{formatFileSize(dashboard.document.sizeBytes)}</span>
                    <span>•</span>
                    <span>{dashboard.document.totalRows.toLocaleString('pt-BR')} linhas</span>
                    <span>•</span>
                    <span>{dashboard.document.totalColumns} colunas</span>
                  </div>
                </div>
              </div>

              {dashboard.document.availableSheets &&
                dashboard.document.availableSheets.length > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Aba:</span>
                    <select
                      className="sheet-selector"
                      onChange={(e) => handleSheetChange(e.target.value)}
                      defaultValue={dashboard.document.availableSheets[0]}
                    >
                      {dashboard.document.availableSheets.map((sheet) => (
                        <option key={sheet} value={sheet}>
                          {sheet}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              <button onClick={handleReset} className="btn btn-secondary">
                <RefreshCw size={14} />
                <span>Trocar Arquivo</span>
              </button>
            </div>

            <SummaryCards cards={dashboard.summaryCards} />

            <ChartSection charts={dashboard.charts} />

            <TextInsights summary={dashboard.textSummary} />

            <DataTable
              columns={dashboard.columns}
              records={dashboard.rawRecords}
              fileName={dashboard.document.name}
            />
          </div>
        )}
      </main>
    </div>
  );
};
