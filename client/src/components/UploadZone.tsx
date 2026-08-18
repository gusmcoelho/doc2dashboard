import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileSpreadsheet, FileText, FileCode } from 'lucide-react';

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileUpload, isLoading }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileUpload(file);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileUpload(file);
    }
  };

  const handleClickCard = () => {
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`upload-card ${isDragActive ? 'drag-active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClickCard}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.pdf,.xlsx,.xls,.csv"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {isLoading ? (
        <div className="loading-overlay">
          <div className="spinner" />
          <h3 className="upload-title">Processando documento...</h3>
          <p className="upload-hint">
            Extraindo tabelas, detectando tipos e gerando métricas visuais
          </p>
        </div>
      ) : (
        <>
          <div className="upload-icon-wrapper">
            <UploadCloud size={36} />
          </div>
          <h3 className="upload-title">Arraste seu documento aqui ou clique para selecionar</h3>
          <p className="upload-hint">
            Processamento automático instantâneo com geração de gráficos e KPIs
          </p>

          <div className="file-types-list">
            <span className="file-type-pill xlsx">
              <FileSpreadsheet size={13} /> .xlsx / .xls
            </span>
            <span className="file-type-pill csv">
              <FileCode size={13} /> .csv
            </span>
            <span className="file-type-pill docx">
              <FileText size={13} /> .docx
            </span>
            <span className="file-type-pill pdf">
              <FileText size={13} /> .pdf
            </span>
          </div>
        </>
      )}
    </div>
  );
};
