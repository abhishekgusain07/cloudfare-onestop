import { Slide, TextElement } from '../types';

/**
 * Migrates old slide format to new format
 * Handles backward compatibility for slides that might still have the old 'text' field
 */
export function migrateSlideToNewFormat(slide: any): Slide {
  // If slide already has textElements, return as is
  if (slide.textElements && Array.isArray(slide.textElements)) {
    return slide as Slide;
  }

  // If slide has old 'text' field, convert it to textElements
  const textElements: TextElement[] = [];
  if (slide.text && typeof slide.text === 'string' && slide.text.trim()) {
    textElements.push({
      id: `migrated-text-${Date.now()}`,
      text: slide.text,
      position: { x: 10, y: 10 },
      size: { width: 80, height: 20 },
      fontFamily: 'Arial',
      fontSize: 24,
      color: '#FFFFFF',
      zIndex: 1
    });
  }

  return {
    id: slide.id,
    slideshowId: slide.slideshowId,
    imageUrl: slide.imageUrl,
    order: slide.order,
    textElements
  };
}

/**
 * Migrates an array of slides to the new format
 */
export function migrateSlidesToNewFormat(slides: any[]): Slide[] {
  return slides.map(migrateSlideToNewFormat);
}

/**
 * Gets the first text content from a slide (for backward compatibility)
 */
export function getSlideTextContent(slide: Slide): string {
  if (!slide.textElements || slide.textElements.length === 0) {
    return '';
  }
  return slide.textElements[0].text || '';
}

/**
 * Creates a default text element for a slide
 */
export function createDefaultTextElement(text: string): TextElement {
  return {
    id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text,
    position: { x: 10, y: 10 },
    size: { width: 80, height: 20 },
    fontFamily: 'Arial',
    fontSize: 24,
    color: '#FFFFFF',
    zIndex: 1
  };
} 