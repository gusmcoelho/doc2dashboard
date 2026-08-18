import React from 'react';
import { LayoutDashboard, UploadCloud, Download, Github } from 'lucide-react';
import { DashboardPayload } from '../types';

interface HeaderProps {
  dashboard: DashboardPayload | null;
  onReset: () => void;
  onExportCsv?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ dashboard, onReset, onExportCsv }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onReset();
            }}
            className="brand-logo"
          >
            <div className="brand-icon">
              <LayoutDashboard size={20} />
            </div>
            <span>doc2dashboard</span>
          </a>
          <span className="brand-badge">Auto Analytics</span>
        </div>

        <div className="header-actions">
          {dashboard && (
            <>
              {onExportCsv && (
                <button
                  onClick={onExportCsv}
                  className="btn btn-secondary"
                  title="Exportar dados limpos em CSV"
                >
                  <Download size={16} />
                  <span>Exportar CSV</span>
                </button>
              )}
              <button onClick={onReset} className="btn btn-primary">
                <UploadCloud size={16} />
                <span>Novo Upload</span>
              </button>
            </>
          )}
          <a
            href="https://github.com/gusmcoelho/doc2dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            title="Ver no GitHub"
          >
            <Github size={18} />
          </a>
        </div>
      </div>
    </header>
  );
};
