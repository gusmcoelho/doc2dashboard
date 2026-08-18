import React from 'react';
import { DocumentTextSummary } from '../types';
import { FileText, AlignLeft, Hash } from 'lucide-react';

interface TextInsightsProps {
  summary?: DocumentTextSummary;
}

export const TextInsights: React.FC<TextInsightsProps> = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="insights-card">
      <div className="insights-header">
        <FileText size={20} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Resumo do Documento de Texto
        </h3>
      </div>

      <p className="insights-content">{summary.preview}</p>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
          }}
        >
          <AlignLeft size={14} />
          <span>{summary.wordCount.toLocaleString('pt-BR')} palavras</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
          }}
        >
          <Hash size={14} />
          <span>{summary.paragraphsCount} seções / parágrafos</span>
        </div>
      </div>

      {summary.extractedHeadings && summary.extractedHeadings.length > 0 && (
        <div className="headings-tags">
          {summary.extractedHeadings.map((heading, idx) => (
            <span key={idx} className="heading-tag">
              #{heading}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
