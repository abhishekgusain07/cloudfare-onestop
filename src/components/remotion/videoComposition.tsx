import React, { useEffect } from 'react';
import { AbsoluteFill, Video, Audio, useVideoConfig, interpolate, useCurrentFrame, delayRender, continueRender } from 'remotion';

interface VideoCompositionProps {
  selectedTemplate: string;
  text: string;
  textPosition: string;
  textAlign: string;
  fontSize: number;
  textColor: string;
  textOpacity: number;
  musicVolume: number;
  musicUrl?: string;
  // Additional props for video template
  templateUrl?: string;
}

// Utility function to transform video URL for Remotion rendering
const transformVideoUrl = (url?: string): string => {
  if (!url) {
    return '/videos/urban-lifestyle.mp4';
  }

  // If it's a relative path without leading slash, add it
  if (!url.startsWith('/')) {
    url = `/${url}`;
  }

  // For Remotion rendering, transform the URL to point to the correct server
  if (url.startsWith('/ugc/videos/')) {
    // Use absolute URL to ensure Remotion can load the video
    return `http://localhost:3001${url}`;
  }

  return url;
};

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  selectedTemplate,
  text,
  textPosition,
  textAlign,
  fontSize,
  textColor,
  musicUrl,
  musicVolume,
  templateUrl = '/videos/urban-lifestyle.mp4', // Default fallback
}:VideoCompositionProps) => {
  const { width, height, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  // Transform the video URL
  const transformedTemplateUrl = transformVideoUrl(templateUrl);

  // Add video loading check with error handling
  useEffect(() => {
    const handle = delayRender('Loading video');
    
    const videoElement = document.createElement('video');
    videoElement.src = transformedTemplateUrl;
    
    const onLoadedMetadata = () => {
      console.log('Video loaded successfully:', {
        src: transformedTemplateUrl,
        duration: videoElement.duration,
        width: videoElement.videoWidth,
        height: videoElement.videoHeight
      });
      continueRender(handle);
    };
    
    const onError = (error: any) => {
      console.error('Video loading error:', {
        src: transformedTemplateUrl,
        error: error,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      continueRender(handle);
    };

    videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
    videoElement.addEventListener('error', onError);

    return () => {
      videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
      videoElement.removeEventListener('error', onError);
    };
  }, [transformedTemplateUrl]);

  // Text animation - fade in over first 30 frames
  const textOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Position mapping for text overlay
  const getTextStyles = () => {
    const baseStyles: React.CSSProperties = {
      fontSize: `${fontSize}px`,
      color: textColor,
      fontWeight: 'bold',
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
      opacity: textOpacity,
      textAlign: textAlign as 'center' | 'left' | 'right',
      width: '80%',
      padding: '0 20px',
      wordWrap: 'break-word',
    };

    switch (textPosition) {
      case 'top':
        return {
          ...baseStyles,
          position: 'absolute' as const,
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'bottom':
        return {
          ...baseStyles,
          position: 'absolute' as const,
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'center':
      default:
        return {
          ...baseStyles,
          position: 'absolute' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <AbsoluteFill>
      {/* Background Video */}
      <Video
        src={transformedTemplateUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        volume={0.3} // Reduce background video volume to make room for music
        muted={Boolean(musicUrl)} // Mute if we have custom music
      />

      {/* Background Music */}
      {musicUrl && (
        <Audio
          src={musicUrl}
          volume={musicVolume}
        />
      )}

      {/* Text Overlay */}
      <AbsoluteFill>
        <div style={getTextStyles()}>
          {text}
        </div>
      </AbsoluteFill>

      {/* Optional: Add subtle vignette effect */}
      <AbsoluteFill>
        <div
          style={{
            background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.3) 100%)',
            width: '100%',
            height: '100%',
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};