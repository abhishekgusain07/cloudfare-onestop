'use client';

import { useState } from 'react';
import { SlideshowEditorLayout, SlideStrip, EditingCanvas, StylingToolbar } from './index';
import { Slide, Slideshow, TextElement } from '../types';

// Mock data for demonstration
const mockSlideshow: Slideshow = {
  id: 'demo-slideshow-1',
  title: 'Demo Slideshow',
  createdAt: new Date().toISOString(),
  status: 'draft',
  outputFormat: 'video',
  slides: []
};

const mockSlides: Slide[] = [
  {
    id: 'slide-1',
    slideshowId: 'demo-slideshow-1',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    order: 0,
    textElements: [
      {
        id: 'text-1',
        text: 'Welcome to our amazing slideshow!',
        position: { x: 10, y: 10 },
        size: { width: 80, height: 20 },
        fontFamily: 'Arial',
        fontSize: 24,
        color: '#FFFFFF',
        zIndex: 1
      }
    ]
  },
  {
    id: 'slide-2',
    slideshowId: 'demo-slideshow-1',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    order: 1,
    textElements: []
  },
  {
    id: 'slide-3',
    slideshowId: 'demo-slideshow-1',
    imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68e2c6b20d?w=800&h=600&fit=crop',
    order: 2,
    textElements: [
      {
        id: 'text-2',
        text: 'Technology that works for you',
        position: { x: 15, y: 70 },
        size: { width: 70, height: 15 },
        fontFamily: 'Helvetica',
        fontSize: 20,
        color: '#000000',
        zIndex: 1
      }
    ]
  }
];

export const SlideshowEditorDemo = () => {
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(mockSlides[0]);
  const [selectedTextElement, setSelectedTextElement] = useState<TextElement | null>(null);
  const [slides, setSlides] = useState<Slide[]>(mockSlides);

  const handleSelectSlide = (slide: Slide) => {
    setSelectedSlide(slide);
    setSelectedTextElement(null);
  };

  const handleDeleteSlide = async (slideId: string) => {
    setSlides(prev => prev.filter(slide => slide.id !== slideId));
    if (selectedSlide?.id === slideId) {
      setSelectedSlide(slides.length > 1 ? slides[0] : null);
    }
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      slideshowId: 'demo-slideshow-1',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
      order: slides.length,
      textElements: []
    };
    setSlides(prev => [...prev, newSlide]);
  };

  const handleAddTextElement = () => {
    if (!selectedSlide) return;
    
    const newTextElement: TextElement = {
      id: `text-${Date.now()}`,
      text: 'New text element',
      position: { x: 20, y: 30 },
      size: { width: 60, height: 10 },
      fontFamily: 'Arial',
      fontSize: 18,
      color: '#FFFFFF',
      zIndex: 1
    };

    const updatedSlide = {
      ...selectedSlide,
      textElements: [...(selectedSlide.textElements || []), newTextElement]
    };

    setSlides(prev => prev.map(slide => 
      slide.id === selectedSlide.id ? updatedSlide : slide
    ));
    setSelectedSlide(updatedSlide);
  };

  return (
    <div className="h-screen">
      <SlideshowEditorLayout
        leftPanel={
          <SlideStrip
            slides={slides}
            selectedSlideId={selectedSlide?.id || null}
            onSelectSlide={handleSelectSlide}
            onDeleteSlide={handleDeleteSlide}
            onAddSlide={handleAddSlide}
            onReorderSlides={(reorderedSlides) => setSlides(reorderedSlides)}
          />
        }
        centerPanel={
          <EditingCanvas
            slides={slides}
            onSelectSlide={handleSelectSlide}
            selectedSlide={selectedSlide}
            selectedTextElement={selectedTextElement}
            onAddTextElement={handleAddTextElement}
            onSelectTextElement={setSelectedTextElement}
            onUpdateTextElement={(textElement) => {
              if (selectedSlide) {
                const updatedSlide = {
                  ...selectedSlide,
                  textElements: selectedSlide.textElements.map(el =>
                    el.id === textElement.id ? textElement : el
                  )
                };
                setSlides(prev => prev.map(slide => 
                  slide.id === selectedSlide.id ? updatedSlide : slide
                ));
                setSelectedSlide(updatedSlide);
                setSelectedTextElement(textElement);
              }
            }}
            onDeleteTextElement={(textElementId) => {
              if (selectedSlide) {
                const updatedSlide = {
                  ...selectedSlide,
                  textElements: selectedSlide.textElements.filter(el => el.id !== textElementId)
                };
                setSlides(prev => prev.map(slide => 
                  slide.id === selectedSlide.id ? updatedSlide : slide
                ));
                setSelectedSlide(updatedSlide);
                setSelectedTextElement(null);
              }
            }}
          />
        }
        rightPanel={
          <StylingToolbar
            selectedTextElement={selectedTextElement}
            currentSlideshow={mockSlideshow}
            onUpdateTextElement={(textElement) => {
              if (selectedSlide) {
                const updatedSlide = {
                  ...selectedSlide,
                  textElements: selectedSlide.textElements.map(el =>
                    el.id === textElement.id ? textElement : el
                  )
                };
                setSlides(prev => prev.map(slide => 
                  slide.id === selectedSlide.id ? updatedSlide : slide
                ));
                setSelectedSlide(updatedSlide);
                setSelectedTextElement(textElement);
              }
            }}
            onAddTextElement={handleAddTextElement}
          />
        }
      />
    </div>
  );
}; 