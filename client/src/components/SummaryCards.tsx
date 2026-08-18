import React from 'react';
import { SummaryCard } from '../types';
import { Layers, DollarSign, Calculator, Award, Calendar, BarChart3 } from 'lucide-react';

interface SummaryCardsProps {
  cards: SummaryCard[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ cards }) => {
  if (!cards || cards.length === 0) return null;

  const renderIcon = (type: string) => {
    switch (type) {
      case 'count':
        return <Layers size={18} className="kpi-icon" />;
      case 'total':
        return <DollarSign size={18} className="kpi-icon" />;
      case 'average':
        return <Calculator size={18} className="kpi-icon" />;
      case 'highlight':
        return <Award size={18} className="kpi-icon" />;
      case 'dateRange':
        return <Calendar size={18} className="kpi-icon" />;
      default:
        return <BarChart3 size={18} className="kpi-icon" />;
    }
  };

  return (
    <div className="summary-grid">
      {cards.map((card) => (
        <div key={card.id} className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">{card.title}</span>
            {renderIcon(card.type)}
          </div>
          <div className="kpi-value">{card.value}</div>
          {card.subtitle && <div className="kpi-subtitle">{card.subtitle}</div>}
        </div>
      ))}
    </div>
  );
};
