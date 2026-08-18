import React from 'react';
import { SampleItem } from '../types';
import { Sparkles, FileSpreadsheet, FileText, FileCode } from 'lucide-react';

interface SampleSelectorProps {
  samples: SampleItem[];
  onSelectSample: (sampleId: string) => void;
  isLoading: boolean;
}

export const SampleSelector: React.FC<SampleSelectorProps> = ({
  samples,
  onSelectSample,
  isLoading,
}) => {
  if (!samples || samples.length === 0) return null;

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet size={16} className="text-emerald" />;
      case 'csv':
        return <FileCode size={16} className="text-amber" />;
      default:
        return <FileText size={16} className="text-blue" />;
    }
  };

  return (
    <div className="samples-section">
      <div className="samples-title">
        <Sparkles
          size={14}
          style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }}
        />
        Ou teste instantaneamente com um exemplo:
      </div>
      <div className="samples-grid">
        {samples.map((s) => (
          <div
            key={s.id}
            className="sample-card"
            onClick={() => !isLoading && onSelectSample(s.id)}
          >
            <div className="sample-card-header">
              <span className="sample-card-title">{s.name}</span>
              {getFileIcon(s.type)}
            </div>
            <p className="sample-card-desc">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
