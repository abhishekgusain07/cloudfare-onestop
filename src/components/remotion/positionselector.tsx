import React from 'react';

interface PositionSelectorProps {
  position: 'top' | 'center' | 'bottom';
  align: 'left' | 'center' | 'right';
  onPositionChange: (position: 'top' | 'center' | 'bottom') => void;
  onAlignChange: (align: 'left' | 'center' | 'right') => void;
}

export const PositionSelector: React.FC<PositionSelectorProps> = ({
  position,
  align,
  onPositionChange,
  onAlignChange,
}) => {
  const PositionButton: React.FC<{
    pos: 'top' | 'center' | 'bottom';
    label: string;
    icon: React.ReactNode;
  }> = ({ pos, label, icon }) => (
    <button
      onClick={() => onPositionChange(pos)}
      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all hover:scale-105 ${
        position === pos
          ? 'border-blue-500 bg-blue-500/20 text-blue-400'
          : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
      }`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  const AlignButton: React.FC<{
    alignment: 'left' | 'center' | 'right';
    label: string;
    icon: React.ReactNode;
  }> = ({ alignment, label, icon }) => (
    <button
      onClick={() => onAlignChange(alignment)}
      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:scale-105 ${
        align === alignment
          ? 'border-green-500 bg-green-500/20 text-green-400'
          : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
      }`}
    >
      <div className="text-xl mb-1">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Text Position</h3>
      
      <div className="space-y-6">
        {/* Vertical Position */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Vertical Position
          </label>
          <div className="grid grid-cols-3 gap-3">
            <PositionButton
              pos="top"
              label="Top"
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 3h16c.55 0 1 .45 1 1s-.45 1-1 1H4c-.55 0-1-.45-1-1s.45-1 1-1z"/>
                  <rect x="6" y="8" width="12" height="2" rx="1"/>
                </svg>
              }
            />
            <PositionButton
              pos="center"
              label="Center"
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="11" width="12" height="2" rx="1"/>
                </svg>
              }
            />
            <PositionButton
              pos="bottom"
              label="Bottom"
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="14" width="12" height="2" rx="1"/>
                  <path d="M4 19h16c.55 0 1 .45 1 1s-.45 1-1 1H4c-.55 0-1-.45-1-1s.45-1 1-1z"/>
                </svg>
              }
            />
          </div>
        </div>

        {/* Horizontal Alignment */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Text Alignment
          </label>
          <div className="grid grid-cols-3 gap-3">
            <AlignButton
              alignment="left"
              label="Left"
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h18c.55 0 1 .45 1 1s-.45 1-1 1H3c-.55 0-1-.45-1-1s.45-1 1-1z"/>
                  <path d="M3 7h12c.55 0 1 .45 1 1s-.45 1-1 1H3c-.55 0-1-.45-1-1s.45-1 1-1z"/>
                  <path d="M3 11h18c.55 0 1 .45 1 1s-.45 1-1 1H3c-.55 0-1-.45-1-1s.45-1 1-1z"/>
                </svg>
              }
            />
            <AlignButton
              alignment="center"
              label="Center"
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h18c.55 0 1 .45 1 1s-.45 1-1 1H3c-.55 0-1-.45-1-1s.45-1 1-1z"/>
                  <path d="M6 7h12c.55 0 1 .45 1 1s-.45 1-1 1H6c-.55 0-1-.45-1-1s.45-1 1-1z"/>
                  <path d="M3 11h18c.55 0 1 .45 1 1s-.45 1-1 1H3c-.55 0-1-.45-1-1s.45-1 1-1z"/>
                </svg>
              }
            />
            <AlignButton
              alignment="right"
              label="Right"
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h18c.55 0 1 .45 1 1s-.45 1-1 1H3c-.55 0-1-.45-1-1s.45-1 1-1z"/>
                  <path d="M9 7h12c.55 0 1 .45 1 1s-.45 1-1 1H9c-.55 0-1-.45-1-1s.45-1 1-1z"/>
                  <path d="M3 11h18c.55 0 1 .45 1 1s-.45 1-1 1H3c-.55 0-1-.45-1-1s.45-1 1-1z"/>
                </svg>
              }
            />
          </div>
        </div>

        {/* Visual Preview */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Preview
          </label>
          <div className="relative bg-gray-900 rounded-lg h-24 border border-gray-600">
            <div
              className={`absolute bg-blue-500 text-white text-xs px-2 py-1 rounded ${
                position === 'top' ? 'top-2' : 
                position === 'bottom' ? 'bottom-2' : 
                'top-1/2 transform -translate-y-1/2'
              } ${
                align === 'left' ? 'left-2' :
                align === 'right' ? 'right-2' :
                'left-1/2 transform -translate-x-1/2'
              }`}
            >
              Your Text
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};