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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp } from 'lucide-react';

interface ChartSectionProps {
  charts: ChartConfig[];
}

const COLORS = [
  '#2563eb',
  '#7c3aed',
  '#059669',
  '#d97706',
  '#e11d48',
  '#0284c7',
  '#db2777',
  '#0d9488',
];

const customTooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  color: '#0f172a',
  fontSize: '0.85rem',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  padding: '8px 12px',
};

export const ChartSection: React.FC<ChartSectionProps> = ({ charts }) => {
  if (!charts || charts.length === 0) return null;

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'pie':
        return <PieIcon size={18} className="chart-icon-header" />;
      case 'line':
      case 'area':
        return <TrendingUp size={18} className="chart-icon-header" />;
      default:
        return <BarChart3 size={18} className="chart-icon-header" />;
    }
  };

  const renderChart = (chart: ChartConfig) => {
    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chart.data} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey={chart.xAxisKey}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '8px' }} />
              {chart.yAxisKeys.map((key, idx) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={COLORS[idx % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chart.data}
                dataKey={chart.yAxisKeys[0] || 'value'}
                nameKey={chart.xAxisKey || 'name'}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={3}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {chart.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chart.data} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey={chart.xAxisKey}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                angle={-20}
                textAnchor="end"
              />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '8px' }} />
              {chart.yAxisKeys.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: COLORS[idx % COLORS.length] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chart.data} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey={chart.xAxisKey}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                angle={-20}
                textAnchor="end"
              />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '8px' }} />
              {chart.yAxisKeys.map((key) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#areaGradient)"
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
        {charts.map((chart) => (
          <div key={chart.id} className="chart-card">
            <div className="chart-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {getChartIcon(chart.type)}
                <div>
                  <h3 className="chart-title">{chart.title}</h3>
                  {chart.description && <p className="chart-desc">{chart.description}</p>}
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
