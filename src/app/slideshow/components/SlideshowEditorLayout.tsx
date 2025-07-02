'use client';

import { ReactNode } from 'react';

interface SlideshowEditorLayoutProps {
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel: ReactNode;
}

export const SlideshowEditorLayout = ({
  leftPanel,
  centerPanel,
  rightPanel
}: SlideshowEditorLayoutProps) => {
  return (
    <div className="h-full min-h-screen bg-gray-50">
      {/* Three-panel CSS Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_320px] h-full min-h-screen gap-4 p-4">
        
        {/* Left Panel - Slide Strip */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-full flex flex-col">
            {leftPanel}
          </div>
        </div>

        {/* Center Panel - Editing Canvas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-full flex flex-col">
            {centerPanel}
          </div>
        </div>

        {/* Right Panel - Styling Toolbar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-full flex flex-col">
            {rightPanel}
          </div>
        </div>
      </div>
    </div>
  );
}; 