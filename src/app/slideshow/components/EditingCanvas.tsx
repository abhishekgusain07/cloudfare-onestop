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
  slides: Slide[];
  onSelectSlide: (slide: Slide) => void;
}

export const EditingCanvas = ({
  selectedSlide,
  selectedTextElement,
  onAddTextElement,
  onSelectTextElement,
  onUpdateTextElement,
  onDeleteTextElement,
  slides,
  onSelectSlide
}: EditingCanvasProps) => {
  console.log('EditingCanvas received selectedSlide:', selectedSlide);
  console.log('EditingCanvas received selectedTextElement:', selectedTextElement);
  
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
    // Only deselect if clicking on the canvas itself, not a text element or its children
    const target = e.target as HTMLElement;
    const canvas = e.currentTarget as HTMLElement;
    
    // Check if the click is directly on the canvas or on the image (not on text elements)
    if (target === canvas || target.tagName === 'IMG') {
      console.log('Canvas clicked - deselecting text element');
      onSelectTextElement?.(null!);
    }
  };

  // Carousel navigation logic
  const currentIndex = selectedSlide ? slides.findIndex(s => s.id === selectedSlide.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < slides.length - 1 && currentIndex !== -1;

  const goPrev = () => {
    if (hasPrev) onSelectSlide(slides[currentIndex - 1]);
  };
  const goNext = () => {
    if (hasNext) onSelectSlide(slides[currentIndex + 1]);
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
          {/* Canvas Container - Dynamic aspect ratio based on image */}
          <div 
            ref={canvasRef}
            className="relative bg-white shadow-lg rounded-lg overflow-hidden"
            style={{ maxWidth: '90%', maxHeight: '90%' }}
            onClick={handleCanvasClick}
          >
            {/* Carousel Arrows */}
            {hasPrev && (
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow"
                onClick={goPrev}
                style={{outline: 'none', border: 'none'}}
                aria-label="Previous slide"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
            )}
            {hasNext && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow"
                onClick={goNext}
                style={{outline: 'none', border: 'none'}}
                aria-label="Next slide"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            )}
            {/* Background Image */}
            <img
              src={selectedSlide.imageUrl}
              alt={`Slide ${selectedSlide.order + 1}`}
              className="block max-w-full max-h-full object-contain pointer-events-none"
              style={{ maxHeight: '80vh', maxWidth: '100%' }}
              onLoad={(e) => {
                console.log('Image loaded successfully:', selectedSlide.imageUrl);
                // Update canvas dimensions based on actual image size
                if (canvasRef.current) {
                  const rect = canvasRef.current.getBoundingClientRect();
                  setCanvasDimensions({
                    width: rect.width,
                    height: rect.height
                  });
                }
              }}
              onError={(e) => {
                console.error('Image failed to load:', selectedSlide.imageUrl);
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
            <div className="absolute inset-0">
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
            </div>

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

            {/* Slide Indicators (dots) */}
            {slides.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    className={`w-2.5 h-2.5 rounded-full ${selectedSlide?.id === slide.id ? 'bg-blue-500' : 'bg-gray-300'} transition-colors`}
                    style={{outline: 'none', border: 'none'}}
                    onClick={() => onSelectSlide(slide)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 