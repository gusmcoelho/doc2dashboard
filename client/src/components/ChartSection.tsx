import React from 'react';
import { ChartConfig } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp } from 'lucide-react';

interface ChartSectionProps {
  charts: ChartConfig[];
}

const COLORS = ['#2563eb', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const customTooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  color: '#0f172a',
  fontSize: '0.85rem',
  fontWeight: 600,
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
  padding: '8px 14px',
};

export const ChartSection: React.FC<ChartSectionProps> = ({ charts }) => {
  if (!charts || charts.length === 0) return null;

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'pie':
        return <PieIcon size={18} />;
      case 'line':
      case 'area':
        return <TrendingUp size={18} />;
      default:
        return <BarChart3 size={18} />;
    }
  };

  const renderChart = (chart: ChartConfig) => {
    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chart.data} margin={{ top: 15, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey={chart.xAxisKey}
                stroke="#94a3b8"
                fontSize={11}
                fontWeight={600}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: '#f8fafc' }} />
              {chart.yAxisKeys.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                  barSize={38}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <div className="donut-split-layout">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={chart.data}
                  dataKey={chart.yAxisKeys[0] || 'value'}
                  nameKey={chart.xAxisKey || 'name'}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {chart.data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>

            <div className="donut-list-items">
              {chart.data.slice(0, 5).map((item, idx) => {
                const color = COLORS[idx % COLORS.length];
                const pct = item.percentage || 0;
                return (
                  <div key={idx} className="donut-list-row">
                    <div className="donut-list-meta">
                      <span className="donut-item-label">
                        <span className="donut-dot" style={{ backgroundColor: color }} />
                        <span>{item.name || item[chart.xAxisKey]}</span>
                      </span>
                      <span className="donut-item-value">
                        {typeof item.value === 'number' ? item.value.toLocaleString('pt-BR') : item.value}
                        {pct > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '6px' }}>({pct}%)</span>}
                      </span>
                    </div>
                    <div className="donut-track">
                      <div
                        className="donut-progress"
                        style={{ width: `${Math.min(100, pct || 20)}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'line':
      case 'area':
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chart.data} margin={{ top: 15, right: 20, left: -10, bottom: 25 }}>
              <defs>
                <linearGradient id="areaGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey={chart.xAxisKey}
                stroke="#94a3b8"
                fontSize={11}
                fontWeight={600}
                tickLine={false}
                angle={-20}
                textAnchor="end"
              />
              <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              {chart.yAxisKeys.map((key) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#areaGradientPrimary)"
                  dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#1d4ed8' }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Gráficos & Visualizações</h2>
          <p className="section-subtitle">
            Visualizações geradas automaticamente para cruzar dados numéricos e categorias
            identificadas no seu documento
          </p>
        </div>
      </div>

      <div className="charts-grid">
        {charts.map((chart, idx) => (
          <div
            key={chart.id}
            className={`chart-card ${charts.length % 2 === 1 && idx === charts.length - 1 ? 'chart-card-full' : ''}`}
          >
            <div className="chart-header">
              <div className="chart-header-left">
                <div className="chart-icon-box">{getChartIcon(chart.type)}</div>
                <div className="chart-title-block">
                  <h3 className="chart-title">{chart.title}</h3>
                  {chart.description && <span className="chart-desc">{chart.description}</span>}
                </div>
              </div>
            </div>
            <div className="chart-container">{renderChart(chart)}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
