import React from 'react';
import { SummaryCard } from '../types';
import { Layers, DollarSign, Calculator, Award, Calendar, BarChart3, TrendingUp, HelpCircle } from 'lucide-react';

interface SummaryCardsProps {
  cards: SummaryCard[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ cards }) => {
  if (!cards || cards.length === 0) return null;

  const getMetricInfo = (card: SummaryCard) => {
    switch (card.type) {
      case 'count':
        return {
          icon: <Layers size={18} />,
          badge: 'CONTAGEM GERAL',
          headerLabel: 'Total de Linhas',
          contextText: 'Volume total de registros no arquivo',
          tooltip: 'Quantidade total de linhas extraídas do documento',
          iconClass: 'count',
        };
      case 'total':
        return {
          icon: <DollarSign size={18} />,
          badge: 'SOMA TOTAL',
          headerLabel: `Soma: ${card.title}`,
          contextText: `Soma de todos os valores da coluna "${card.title}"`,
          tooltip: `Soma acumulada de todos os registros numéricos da coluna "${card.title}"`,
          iconClass: 'total',
        };
      case 'average':
        return {
          icon: <Calculator size={18} />,
          badge: 'MÉDIA POR REGISTRO',
          headerLabel: `Média: ${card.title}`,
          contextText: `Média calculada para a coluna "${card.title}"`,
          tooltip: `Valor médio por linha calculado para "${card.title}"`,
          iconClass: 'average',
        };
      case 'highlight':
        return {
          icon: <Award size={18} />,
          badge: 'MAIS FREQUENTE',
          headerLabel: `Destaque: ${card.title}`,
          contextText: `Item com maior ocorrência na coluna "${card.title}"`,
          tooltip: `Categoria que mais se repete na coluna "${card.title}"`,
          iconClass: 'highlight',
        };
      case 'dateRange':
        return {
          icon: <Calendar size={18} />,
          badge: 'PERÍODO COBERTO',
          headerLabel: `Datas: ${card.title}`,
          contextText: `Intervalo temporal da coluna "${card.title}"`,
          tooltip: `Data inicial e final identificadas na coluna "${card.title}"`,
          iconClass: 'dateRange',
        };
      default:
        return {
          icon: <BarChart3 size={18} />,
          badge: 'INDICADOR',
          headerLabel: `Indicador: ${card.title}`,
          contextText: `Métrica da coluna "${card.title}"`,
          tooltip: `Estatística calculada para "${card.title}"`,
          iconClass: 'count',
        };
    }
  };

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Resumo dos Indicadores</h2>
          <p className="section-subtitle">
            Métricas calculadas automaticamente a partir dos dados do seu documento
          </p>
        </div>
      </div>

      <div className="summary-grid">
        {cards.map((card) => {
          const info = getMetricInfo(card);
          return (
            <div key={card.id} className="kpi-card" title={info.tooltip}>
              <div className="kpi-header">
                <div className="kpi-title-block">
                  <span className="kpi-subhead">{info.badge}</span>
                  <span className="kpi-title" title={info.headerLabel}>
                    {info.headerLabel}
                  </span>
                </div>
                <div className={`kpi-icon-box ${info.iconClass}`}>{info.icon}</div>
              </div>

              <div className="kpi-value">{card.value}</div>

              <div className="kpi-footer">
                <span className="trend-badge">
                  <TrendingUp size={13} />
                  <span>{card.subtitle || info.contextText}</span>
                </span>
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
