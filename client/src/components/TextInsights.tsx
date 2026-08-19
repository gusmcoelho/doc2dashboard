import React from 'react';
import { DocumentTextSummary } from '../types';
import { FileText, AlignLeft, Hash } from 'lucide-react';

interface TextInsightsProps {
  summary?: DocumentTextSummary;
}

export const TextInsights: React.FC<TextInsightsProps> = ({ summary }) => {
  if (!summary) return null;

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Resumo do Documento de Texto</h2>
          <p className="section-subtitle">
            Estrutura e principais tópicos extraídos do conteúdo textual do documento
          </p>
        </div>
      </div>

      <div className="insights-card">
        <div className="insights-header">
          <FileText size={18} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Prévia do Conteúdo
          </h3>
        </div>

        <p className="insights-content">{summary.preview}</p>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-secondary)',
              fontSize: '0.825rem',
            }}
          >
            <AlignLeft size={15} />
            <span>
              <strong>{summary.wordCount.toLocaleString('pt-BR')}</strong> palavras
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-secondary)',
              fontSize: '0.825rem',
            }}
          >
            <Hash size={15} />
            <span>
              <strong>{summary.paragraphsCount}</strong> seções / parágrafos
            </span>
          </div>
        </div>

        {summary.extractedHeadings && summary.extractedHeadings.length > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
              }}
            >
              Tópicos e Cabeçalhos Identificados:
            </span>
            <div className="headings-tags">
              {summary.extractedHeadings.map((heading, idx) => (
                <span key={idx} className="heading-tag">
                  {heading}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
