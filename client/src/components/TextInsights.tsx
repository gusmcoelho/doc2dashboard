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
          <div className="chart-icon-box" style={{ width: '36px', height: '36px' }}>
            <FileText size={18} />
          </div>
          <div className="chart-title-block">
            <h3 className="chart-title">Prévia e Indicadores Textuais</h3>
            <span className="chart-desc">EXTRAÇÃO DE CONTEÚDO E SEÇÕES</span>
          </div>
        </div>

        <p className="insights-content">{summary.preview}</p>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <AlignLeft size={16} style={{ color: 'var(--primary-blue)' }} />
            <span><strong style={{ color: 'var(--text-primary)' }}>{summary.wordCount.toLocaleString('pt-BR')}</strong> palavras</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Hash size={16} style={{ color: 'var(--primary-blue)' }} />
            <span><strong style={{ color: 'var(--text-primary)' }}>{summary.paragraphsCount}</strong> seções / parágrafos</span>
          </div>
        </div>

        {summary.extractedHeadings && summary.extractedHeadings.length > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-subheading)', letterSpacing: '0.06em' }}>
              Tópicos e Cabeçalhos Identificados:
            </span>
            <div className="headings-tags">
              {summary.extractedHeadings.map((heading, idx) => (
                <span key={idx} className="heading-tag">
                  #{heading}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
