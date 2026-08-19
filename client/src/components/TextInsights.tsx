import React from 'react';
import { DocumentTextSummary } from '../types';
import { FileText, AlignLeft, BookOpen, Tag } from 'lucide-react';

interface TextInsightsProps {
  summary?: DocumentTextSummary;
}

export const TextInsights: React.FC<TextInsightsProps> = ({ summary }) => {
  if (!summary || !summary.preview) return null;

  // Split preview by newlines into clean distinct paragraphs
  const paragraphs = summary.preview
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length === 0) return null;

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
        <div className="insights-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="chart-icon-box" style={{ width: '36px', height: '36px' }}>
              <FileText size={18} />
            </div>
            <div className="chart-title-block">
              <h3 className="chart-title">Conteúdo Narrativo e Contexto</h3>
              <span className="chart-desc">EXTRAÇÃO DE PARÁGRAFOS DO DOCUMENTO</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="file-type-pill" style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: 'var(--text-secondary)' }}>
              <AlignLeft size={13} style={{ color: 'var(--primary-blue)' }} />
              <span><strong>{summary.wordCount.toLocaleString('pt-BR')}</strong> palavras</span>
            </div>
            <div className="file-type-pill" style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: 'var(--text-secondary)' }}>
              <BookOpen size={13} style={{ color: 'var(--primary-blue)' }} />
              <span><strong>{summary.paragraphsCount}</strong> {summary.paragraphsCount === 1 ? 'parágrafo' : 'parágrafos'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
          {paragraphs.map((para, idx) => (
            <p
              key={idx}
              style={{
                fontSize: '0.925rem',
                color: 'var(--text-primary)',
                lineHeight: 1.7,
                background: '#f8fafc',
                padding: '0.85rem 1.15rem',
                borderRadius: '10px',
                border: '1px solid #eef2f7',
              }}
            >
              {para}
            </p>
          ))}
        </div>

        {summary.extractedHeadings && summary.extractedHeadings.length > 0 && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.65rem' }}>
              <Tag size={13} style={{ color: 'var(--primary-blue)' }} />
              <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-subheading)', letterSpacing: '0.05em' }}>
                Tópicos e Seções Identificados:
              </span>
            </div>
            <div className="headings-tags">
              {summary.extractedHeadings.map((heading, idx) => (
                <span
                  key={idx}
                  className="heading-tag"
                  style={{
                    background: '#ffffff',
                    color: 'var(--text-primary)',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.75rem',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)',
                  }}
                >
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
