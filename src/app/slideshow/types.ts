export interface TextElement {
  id: string;
  text: string;
  position: { x: number; y: number }; // Position (top-left) as a % of canvas dimensions
  size: { width: number; height: number }; // Size as a % of canvas dimensions
  fontFamily: string;
  fontSize: number;    // Font size in pixels (relative to a base canvas size)
  color: string;       // Hex or RGBA color string
  zIndex: number;      // Stacking order
}

export interface Slideshow {
  id: string;
  title: string;
  createdAt: string;
  slides: Slide[];
  status: 'draft' | 'rendering' | 'completed' | 'failed';
  outputFormat: 'video' | 'images'; // User's desired output
  renderUrl?: string | null; // URL to the final rendered file (video or zip of images)
}

export interface Slide {
  id: string;
  slideshowId: string;
  imageUrl: string;
  order: number; // Explicitly define the order of the slide
  textElements: TextElement[]; // Array of text elements for this slide
}

export interface UserImage {
  id: string;
  url: string;
  collectionId: string;
}

export interface ImageCollection {
  id: string;
  name: string;
  images: UserImage[];
} 