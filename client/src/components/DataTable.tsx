import React, { useState, useMemo } from 'react';
import { ColumnMeta } from '../types';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Download, Table as TableIcon } from 'lucide-react';

interface DataTableProps {
  columns: ColumnMeta[];
  records: Array<Record<string, any>>;
  fileName: string;
}

export const DataTable: React.FC<DataTableProps> = ({ columns, records, fileName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (colName: string) => {
    if (sortColumn === colName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(colName);
      setSortDirection('asc');
    }
  };

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const lowerSearch = searchTerm.toLowerCase();

    return records.filter((row) =>
      Object.values(row).some((val) =>
        val !== null && val !== undefined && String(val).toLowerCase().includes(lowerSearch)
      )
    );
  }, [records, searchTerm]);

  const sortedRecords = useMemo(() => {
    if (!sortColumn) return filteredRecords;

    return [...filteredRecords].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined || valA === '') return 1;
      if (valB === null || valB === undefined || valB === '') return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      return sortDirection === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredRecords, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${fileName.replace(/\.[^/.]+$/, '')}_dados.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getColTypeClass = (type: string) => {
    switch (type) {
      case 'numeric':
        return 'numeric';
      case 'categorical':
        return 'categorical';
      case 'date':
        return 'date';
      case 'boolean':
        return 'boolean';
      default:
        return 'text';
    }
  };

  if (!records || records.length === 0) return null;

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Dados Brutos</h2>
          <p className="section-subtitle">
            Esta tabela mostra os dados extraídos do seu arquivo com tipos de coluna detectados automaticamente
          </p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header-controls">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="chart-icon-box" style={{ width: '34px', height: '34px' }}>
              <TableIcon size={17} />
            </div>
            <div>
              <span style={{ fontSize: '0.925rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Registros Carregados
              </span>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                ({records.length.toLocaleString('pt-BR')} linhas)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar em todas as colunas..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="table-search-input"
                style={{ paddingLeft: '34px' }}
              />
            </div>

            <button onClick={exportToJson} className="btn btn-secondary" title="Exportar dados tratados em JSON">
              <Download size={14} />
              <span>Exportar JSON</span>
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.name} onClick={() => handleSort(col.name)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>{col.name}</span>
                      <span className={`col-type-tag ${getColTypeClass(col.type)}`} title={`Tipo detectado: ${col.type}`}>
                        {col.type}
                      </span>
                      <ArrowUpDown size={12} style={{ opacity: sortColumn === col.name ? 1 : 0.25 }} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {columns.map((col) => {
                    const rawVal = row[col.name];
                    const isNum = col.type === 'numeric' && typeof rawVal === 'number';
                    const displayVal = rawVal !== undefined && rawVal !== null ? String(rawVal) : '-';
                    return (
                      <td key={col.name} style={{ fontWeight: isNum ? 700 : 500, fontFamily: isNum ? 'var(--font-mono)' : 'inherit' }}>
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-controls">
          <div>
            Exibindo {Math.min((currentPage - 1) * pageSize + 1, sortedRecords.length)} a{' '}
            {Math.min(currentPage * pageSize, sortedRecords.length)} de {sortedRecords.length}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="sheet-selector"
            >
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
            </select>

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-ghost"
              style={{ padding: '0.35rem 0.6rem' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-ghost"
              style={{ padding: '0.35rem 0.6rem' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
