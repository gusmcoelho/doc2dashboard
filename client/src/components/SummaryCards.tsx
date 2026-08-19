import React from 'react';
import { SummaryCard } from '../types';
import { Layers, DollarSign, Calculator, Award, Calendar, BarChart3, TrendingUp, HelpCircle } from 'lucide-react';

interface SummaryCardsProps {
  cards: SummaryCard[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ cards }) => {
  if (!cards || cards.length === 0) return null;

  const getMetricInfo = (type: string) => {
    switch (type) {
      case 'count':
        return {
          icon: <Layers size={18} />,
          subhead: 'Registros',
          tooltip: 'Quantidade total de registros extraídos do documento',
          trendLabel: 'Documento ativo',
        };
      case 'total':
        return {
          icon: <DollarSign size={18} />,
          subhead: 'Total Consolidado',
          tooltip: 'Soma acumulada de todos os valores numéricos desta coluna',
          trendLabel: 'Soma global',
        };
      case 'average':
        return {
          icon: <Calculator size={18} />,
          subhead: 'Média por Registro',
          tooltip: 'Média aritmética calculada para os valores desta coluna',
          trendLabel: 'Média calculada',
        };
      case 'highlight':
        return {
          icon: <Award size={18} />,
          subhead: 'Destaque Principal',
          tooltip: 'Item com maior número de ocorrências nesta coluna',
          trendLabel: 'Maior frequência',
        };
      case 'dateRange':
        return {
          icon: <Calendar size={18} />,
          subhead: 'Linha do Tempo',
          tooltip: 'Intervalo entre a primeira e a última data identificada',
          trendLabel: 'Período coberto',
        };
      default:
        return {
          icon: <BarChart3 size={18} />,
          subhead: 'Indicador',
          tooltip: 'Estatística calculada a partir dos dados do documento',
          trendLabel: 'Indicador direto',
        };
    }
  };

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Indicadores Principais</h2>
          <p className="section-subtitle">
            Métricas consolidadas calculadas diretamente a partir das colunas do seu arquivo
          </p>
        </div>
      </div>

      <div className="summary-grid">
        {cards.map((card) => {
          const info = getMetricInfo(card.type);
          return (
            <div key={card.id} className="kpi-card" title={info.tooltip}>
              <div className="kpi-header">
                <div className="kpi-title-block">
                  <span className="kpi-subhead">{info.subhead}</span>
                  <span className="kpi-title" title={card.title}>
                    {card.title}
                  </span>
                </div>
                <div className={`kpi-icon-box ${card.type}`}>{info.icon}</div>
              </div>

              <div className="kpi-value">{card.value}</div>

              <div className="kpi-footer">
                <span className="trend-badge">
                  <TrendingUp size={13} />
                  <span>{info.trendLabel}</span>
                </span>
                {card.subtitle && (
                  <span style={{ color: 'var(--text-muted)' }}>
                    • {card.subtitle}
                  </span>
                )}
                <span title={info.tooltip} style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 'auto' }}>
                  <HelpCircle size={12} className="help-icon" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
