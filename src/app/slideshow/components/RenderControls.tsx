import React from 'react';

interface RenderControlsProps {
  status: 'idle' | 'rendering' | 'completed' | 'failed';
  renderUrl?: string | null;
  onExport: () => void;
  isExporting: boolean;
}

export const RenderControls: React.FC<RenderControlsProps> = ({
  status,
  renderUrl,
  onExport,
  isExporting
}) => {
  return (
    <div className="p-4 border-b border-gray-200 flex flex-col gap-4">
      <h3 className="font-semibold text-gray-900 mb-2">Export Slideshow</h3>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        onClick={onExport}
        disabled={isExporting || status === 'rendering'}
      >
        {isExporting || status === 'rendering' ? 'Exporting...' : 'Export Slideshow as Images'}
      </button>
      <div className="text-sm text-gray-700">
        Status: {status === 'idle' ? 'Ready' : status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
      {status === 'completed' && renderUrl && (
        <a
          href={renderUrl}
          className="bg-green-600 text-white px-4 py-2 rounded mt-2 inline-block text-center"
          download
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Images (ZIP)
        </a>
      )}
      {status === 'failed' && (
        <div className="text-red-600">Export failed. Please try again.</div>
      )}
    </div>
  );
}; 