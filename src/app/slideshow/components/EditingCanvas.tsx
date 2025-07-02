'use client';

import { useState, useRef, useEffect } from 'react';
import { Slide, TextElement } from '../types';
import { Type, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DraggableTextBox } from './DraggableTextBox';

interface EditingCanvasProps {
  selectedSlide: Slide | null;
  selectedTextElement: TextElement | null;
  onAddTextElement?: () => void;
  onSelectTextElement?: (textElement: TextElement) => void;
  onUpdateTextElement?: (textElement: TextElement) => void;
  onDeleteTextElement?: (textElementId: string) => void;
}

export const EditingCanvas = ({
  selectedSlide,
  selectedTextElement,
  onAddTextElement,
  onSelectTextElement,
  onUpdateTextElement,
  onDeleteTextElement
}: EditingCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 450 });

  // Update canvas dimensions when the container resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [selectedSlide]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking on the canvas itself, not a text element
    if (e.target === e.currentTarget) {
      onSelectTextElement?.(null as any);
    }
  };
  if (!selectedSlide) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Canvas</h3>
          <p className="text-sm text-gray-600">Select a slide to start editing</p>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="bg-gray-100 rounded-full p-6 mb-4 mx-auto w-fit">
              <Type className="w-12 h-12 text-gray-400" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Welcome to the Editor!</h4>
            <p className="text-sm text-gray-600">
              Create a slideshow and add slides from the left panel to start editing. 
              You can add images from the Images tab.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Canvas</h3>
            <p className="text-sm text-gray-600">
              Slide {selectedSlide.order + 1} • {selectedSlide.textElements?.length || 0} text elements
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onAddTextElement}
            disabled={!onAddTextElement}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Text
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-6 bg-gray-50">
        <div className="h-full flex items-center justify-center">
          {/* Canvas Container - 16:9 aspect ratio */}
          <div 
            ref={canvasRef}
            className="relative bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl w-full aspect-video"
            onClick={handleCanvasClick}
          >
            {/* Background Image */}
            <img
              src={selectedSlide.imageUrl}
              alt={`Slide ${selectedSlide.order + 1}`}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.error-placeholder')) {
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'error-placeholder absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400';
                  errorDiv.innerHTML = '<div class="text-center"><div class="text-6xl mb-2">📷</div><div>Image failed to load</div></div>';
                  parent.appendChild(errorDiv);
                }
              }}
            />

            {/* Interactive Text Elements */}
            {selectedSlide.textElements && selectedSlide.textElements.length > 0 && (
              <>
                {selectedSlide.textElements.map((textElement) => (
                  <DraggableTextBox
                    key={textElement.id}
                    textElement={textElement}
                    isSelected={selectedTextElement?.id === textElement.id}
                    canvasWidth={canvasDimensions.width}
                    canvasHeight={canvasDimensions.height}
                    onSelect={onSelectTextElement || (() => {})}
                    onUpdate={onUpdateTextElement || (() => {})}
                    onDelete={onDeleteTextElement || (() => {})}
                  />
                ))}
              </>
            )}

            {/* Guidelines overlay - only show when text element is selected */}
            {selectedTextElement && (
              <div className="absolute inset-0 pointer-events-none opacity-30">
                {/* Center lines */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-400 transform -translate-y-1/2"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-400 transform -translate-x-1/2"></div>
                {/* Grid lines */}
                <div className="absolute top-1/4 left-0 right-0 h-px bg-blue-300 transform -translate-y-1/2"></div>
                <div className="absolute top-3/4 left-0 right-0 h-px bg-blue-300 transform -translate-y-1/2"></div>
                <div className="absolute left-1/4 top-0 bottom-0 w-px bg-blue-300 transform -translate-x-1/2"></div>
                <div className="absolute left-3/4 top-0 bottom-0 w-px bg-blue-300 transform -translate-x-1/2"></div>
              </div>
            )}

            {/* Add text prompt when no text elements exist */}
            {(!selectedSlide.textElements || selectedSlide.textElements.length === 0) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white bg-opacity-90 p-4 rounded-lg text-center">
                  <Type className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click "Add Text" to start adding text elements</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 