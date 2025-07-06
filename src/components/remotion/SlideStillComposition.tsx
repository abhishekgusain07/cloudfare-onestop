import React, { useEffect, useState } from 'react';
import { delayRender, continueRender } from 'remotion';

export interface TextElement {
  id: string;
  text: string;
  position: { x: number; y: number }; // % of canvas
  size: { width: number; height: number }; // % of canvas
  fontFamily: string;
  fontSize: number;
  color: string;
  zIndex: number;
}

interface SlideStillCompositionProps {
  imageUrl: string; // Now expects a full URL
  textElements: TextElement[];
  width?: number;
  height?: number;
}

export const SlideStillComposition: React.FC<SlideStillCompositionProps> = ({
  imageUrl,
  textElements,
  width = 1080,
  height = 1920,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [handle] = useState(() => delayRender());

  // Add debugging logs
  console.log('SlideStillComposition rendering with imageUrl:', imageUrl);
  console.log('Canvas dimensions:', { width, height });

  useEffect(() => {
    if (imageLoaded) {
      console.log('Image loaded, continuing render...');
      continueRender(handle);
    }
  }, [imageLoaded, handle]);

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', imageUrl);
    setImageLoaded(true);
  };

  const handleImageError = (e: any) => {
    console.error('Image failed to load:', imageUrl);
    console.error('Error details:', e);
    // Continue render even on error to avoid hanging
    continueRender(handle);
  };
  
  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      {/* Background Image */}
      <img
        src={imageUrl}
        alt="Slide background"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover', // Changed back to cover for proper scaling
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        crossOrigin="anonymous"
      />
      {/* Text Overlays */}
      {textElements?.map((el) => (
        <div
          key={el.id}
          style={{
            position: 'absolute',
            left: `${el.position.x}%`,
            top: `${el.position.y}%`,
            width: `${el.size.width}%`,
            height: `${el.size.height}%`,
            fontFamily: el.fontFamily,
            fontSize: el.fontSize,
            color: el.color,
            zIndex: el.zIndex,
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
            pointerEvents: 'none',
          }}
        >
          {el.text}
        </div>
      ))}
    </div>
  );
}; 