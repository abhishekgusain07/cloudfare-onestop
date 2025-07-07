'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, Type, Image as ImageIcon } from 'lucide-react';
import { Slideshow, Slide } from '../types';

interface SlideshowEditorProps {
  currentSlideshow: Slideshow | null;
  slides: Slide[];
  selectedSlide: Slide | null;
  onSelectSlide: (slide: Slide) => void;
  onDeleteSlide: (slideId: string) => Promise<void>;
  onUpdateSlideText: (slideId: string, text: string) => Promise<void>;
  onGoToImages: () => void;
}

export const SlideshowEditor = ({
  currentSlideshow,
  slides,
  selectedSlide,
  onSelectSlide,
  onDeleteSlide,
  onUpdateSlideText,
  onGoToImages
}: SlideshowEditorProps) => {
  if (!currentSlideshow) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Slideshow Selected</h3>
          <p className="text-gray-600 mb-4">Create a new slideshow or select an existing one to start editing</p>
          <Button onClick={() => window.location.hash = '#my-slideshows'}>
            View My Slideshows
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Slides Panel */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Slides ({slides.length})</span>
              <Button
                size="sm"
                onClick={onGoToImages}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {slides && slides.length > 0 ? slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedSlide?.id === slide.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onSelectSlide(slide)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gray-200 rounded overflow-hidden">
                      <img
                        src={slide.imageUrl}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Slide {index + 1}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {slide.textElements.map(text => text.text).join(', ') || 'No text'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlide(slide.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No slides yet. Go to Images tab to add slides!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Panel */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSlide ? (
              <div className="space-y-4">
                <div className="relative bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: '200px' }}>
                  <div className="relative">
                    <img
                      src={selectedSlide.imageUrl}
                      alt="Slide preview"
                      className="max-w-full max-h-[500px] object-contain block"
                    />
                    {selectedSlide.textElements.length > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="bg-black bg-opacity-50 text-white p-3 rounded-lg text-center max-w-full">
                          <p className="text-sm font-medium break-words">
                            {selectedSlide.textElements.map(text => text.text).join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ minHeight: '200px' }}>
                <p className="text-gray-500">Select a slide to preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Text Editor Panel */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Text Overlay</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSlide ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="slide-text">Text Content</Label>
                  <Textarea
                    id="slide-text"
                    placeholder="Enter text for this slide..."
                    value={selectedSlide.textElements.map(text => text.text).join(', ')}
                    onChange={(e) => {
                      const newText = e.target.value;
                      // Update locally for immediate feedback
                      const updatedSlide = { ...selectedSlide, textElements: [{ id: 'text-1', text: newText, position: { x: 10, y: 10 }, size: { width: 80, height: 20 }, fontFamily: 'Arial', fontSize: 24, color: '#FFFFFF', zIndex: 1 }] };
                      onSelectSlide(updatedSlide);
                    }}
                    onBlur={() => onUpdateSlideText(selectedSlide.id, selectedSlide.textElements.map(text => text.text).join(', '))}
                    rows={4}
                  />
                </div>
                <Button
                  onClick={() => onUpdateSlideText(selectedSlide.id, selectedSlide.textElements.map(text => text.text).join(', '))}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Text
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Type className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a slide to edit text</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 