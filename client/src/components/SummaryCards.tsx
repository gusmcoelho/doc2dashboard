import React from 'react';
import { SummaryCard } from '../types';
import {
  Layers,
  DollarSign,
  Calculator,
  Award,
  Calendar,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

interface SummaryCardsProps {
  cards: SummaryCard[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ cards }) => {
  if (!cards || cards.length === 0) return null;

  const getMetricInfo = (type: string) => {
    switch (type) {
      case 'count':
        return {
          icon: <Layers size={16} />,
          badge: 'Total de Linhas',
          tooltip: 'Quantidade total de registros extraídos do documento',
        };
      case 'total':
        return {
          icon: <DollarSign size={16} />,
          badge: 'Soma Total',
          tooltip: 'Soma acumulada de todos os valores numéricos desta coluna',
        };
      case 'average':
        return {
          icon: <Calculator size={16} />,
          badge: 'Média',
          tooltip: 'Média aritmética calculada para os valores desta coluna',
        };
      case 'highlight':
        return {
          icon: <Award size={16} />,
          badge: 'Mais Frequente',
          tooltip: 'Item com maior número de ocorrências nesta coluna',
        };
      case 'dateRange':
        return {
          icon: <Calendar size={16} />,
          badge: 'Período',
          tooltip: 'Intervalo entre a primeira e a última data identificada',
        };
      default:
        return {
          icon: <BarChart3 size={16} />,
          badge: 'Métrica',
          tooltip: 'Estatística calculada a partir dos dados do documento',
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
                <span className="kpi-title" title={card.title}>
                  {card.title}
                </span>
                <span className={`kpi-badge ${card.type}`}>
                  {info.icon}
                  <span>{info.badge}</span>
                </span>
              </div>
              <div className="kpi-value">{card.value}</div>
              {card.subtitle && (
                <div className="kpi-subtitle">
                  <span>{card.subtitle}</span>
                  <span
                    title={info.tooltip}
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    <HelpCircle size={12} className="help-icon" />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
