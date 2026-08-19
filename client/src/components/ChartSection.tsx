import React, { useState, useMemo } from 'react';
import { ChartConfig, ColumnMeta } from '../types';
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
import { BarChart3, PieChart as PieIcon, TrendingUp, SlidersHorizontal, Info } from 'lucide-react';

interface ChartSectionProps {
  charts: ChartConfig[];
  columns: ColumnMeta[];
  records: Array<Record<string, any>>;
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

export const ChartSection: React.FC<ChartSectionProps> = ({ charts, columns, records }) => {
  const categoricalColumns = useMemo(
    () => columns.filter((c) => c.type === 'categorical' || c.type === 'text' || c.type === 'date'),
    [columns]
  );
  const numericColumns = useMemo(() => columns.filter((c) => c.type === 'numeric'), [columns]);

  const [selectedX, setSelectedX] = useState<string>(
    categoricalColumns[0]?.name || columns[0]?.name || ''
  );
  const [selectedY, setSelectedY] = useState<string>(numericColumns[0]?.name || '');
  const [aggregation, setAggregation] = useState<'sum' | 'avg' | 'count'>('sum');
  const [customChartType, setCustomChartType] = useState<'bar' | 'area' | 'pie'>('bar');

  const customChartData = useMemo(() => {
    if (!selectedX || records.length === 0) return [];

    const map = new Map<string, { sum: number; count: number }>();

    for (const row of records) {
      const key = String(row[selectedX] ?? 'Outros').trim() || 'N/A';
      const val = typeof row[selectedY] === 'number' ? row[selectedY] : 0;
      const current = map.get(key) || { sum: 0, count: 0 };
      map.set(key, {
        sum: current.sum + val,
        count: current.count + 1,
      });
    }

    return Array.from(map.entries())
      .sort((a, b) => {
        const valA = aggregation === 'sum' ? a[1].sum : aggregation === 'avg' ? a[1].sum / a[1].count : a[1].count;
        const valB = aggregation === 'sum' ? b[1].sum : aggregation === 'avg' ? b[1].sum / b[1].count : b[1].count;
        return valB - valA;
      })
      .slice(0, 10)
      .map(([cat, stats]) => {
        let value = stats.sum;
        if (aggregation === 'avg') {
          value = Number((stats.sum / (stats.count || 1)).toFixed(2));
        } else if (aggregation === 'count') {
          value = stats.count;
        } else {
          value = Number(stats.sum.toFixed(2));
        }
        return {
          [selectedX]: cat,
          [selectedY || 'Contagem']: value,
          valor: value,
          quantidade: stats.count,
        };
      });
  }, [records, selectedX, selectedY, aggregation]);

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

  const formatNumber = (val: any) => {
    if (typeof val === 'number') {
      return val.toLocaleString('pt-BR');
    }
    return String(val);
  };

  const renderSingleChart = (chart: ChartConfig) => {
    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={chart.data} margin={{ top: 15, right: 20, left: -5, bottom: 25 }}>
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
              <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} tickFormatter={formatNumber} />
              <Tooltip
                contentStyle={customTooltipStyle}
                cursor={{ fill: '#f8fafc' }}
                formatter={(val: any) => [formatNumber(val), chart.yAxisKeys[0] || 'Valor']}
              />
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
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chart.data}
                  dataKey={chart.yAxisKeys[0] || 'value'}
                  nameKey={chart.xAxisKey || 'name'}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {chart.data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={customTooltipStyle}
                  formatter={(val: any) => [formatNumber(val), 'Quantidade / Valor']}
                />
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
                        {typeof item.value === 'number' ? formatNumber(item.value) : item.value}
                        {pct > 0 && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '6px' }}>
                            ({pct}%)
                          </span>
                        )}
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
          <ResponsiveContainer width="100%" height={290}>
            <AreaChart data={chart.data} margin={{ top: 15, right: 20, left: -5, bottom: 25 }}>
              <defs>
                <linearGradient id={`areaGrad-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
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
              <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} tickFormatter={formatNumber} />
              <Tooltip
                contentStyle={customTooltipStyle}
                formatter={(val: any) => [formatNumber(val), chart.yAxisKeys[0] || 'Valor']}
              />
              {chart.yAxisKeys.map((key) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={`url(#areaGrad-${chart.id})`}
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
          <h2 className="section-title">Análise Visual dos Dados</h2>
          <p className="section-subtitle">
            Gráficos automáticos e explorador interativo para analisar qualquer coluna do seu documento
          </p>
        </div>
      </div>

      {numericColumns.length > 0 && categoricalColumns.length > 0 && (
        <div className="chart-card chart-card-full" style={{ marginBottom: '1.35rem' }}>
          <div className="chart-header">
            <div className="chart-header-left">
              <div className="chart-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <SlidersHorizontal size={18} />
              </div>
              <div className="chart-title-block">
                <h3 className="chart-title">Explorador Interativo de Dados</h3>
                <span className="chart-desc">CRUZE QUALQUER COLUNA DO SEU DOCUMENTO</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Eixo X:</span>
                <select
                  className="sheet-selector"
                  value={selectedX}
                  onChange={(e) => setSelectedX(e.target.value)}
                >
                  {categoricalColumns.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Métrica Y:</span>
                <select
                  className="sheet-selector"
                  value={selectedY}
                  onChange={(e) => setSelectedY(e.target.value)}
                >
                  {numericColumns.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Cálculo:</span>
                <select
                  className="sheet-selector"
                  value={aggregation}
                  onChange={(e: any) => setAggregation(e.target.value)}
                >
                  <option value="sum">Soma Total</option>
                  <option value="avg">Média</option>
                  <option value="count">Contagem de Linhas</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Visualização:</span>
                <select
                  className="sheet-selector"
                  value={customChartType}
                  onChange={(e: any) => setCustomChartType(e.target.value)}
                >
                  <option value="bar">Barras</option>
                  <option value="area">Área / Linha</option>
                  <option value="pie">Pizza / Donut</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ padding: '0.25rem 0 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--primary-blue)', fontWeight: 600, marginBottom: '0.75rem' }}>
              <Info size={15} />
              <span>
                Exibindo a <strong>{aggregation === 'sum' ? 'Soma' : aggregation === 'avg' ? 'Média' : 'Contagem'}</strong> da coluna <strong>"{selectedY}"</strong> agrupada por cada <strong>"{selectedX}"</strong> (Top 10).
              </span>
            </div>

            <div className="chart-container">
              {renderSingleChart({
                id: 'custom-interactive',
                title: `${selectedY} por ${selectedX}`,
                type: customChartType,
                xAxisKey: selectedX,
                yAxisKeys: [selectedY || 'Contagem'],
                data: customChartData,
              })}
            </div>
          </div>
        </div>
      )}

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
            <div className="chart-container">{renderSingleChart(chart)}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
