import React, { useEffect, useState, useMemo } from 'react';
import { AbsoluteFill, Video, Audio, useVideoConfig, interpolate, useCurrentFrame } from 'remotion';

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
  templateUrl?: string;
  onDurationFound?: (duration: number) => void;
  // New trimming parameters
  musicStartTime?: number;
  musicEndTime?: number;
}

// Simplified utility function to transform video URL for R2 compatibility
const transformVideoUrl = (url?: string, selectedTemplate?: string): string => {
  // If templateUrl is provided and is a full URL (R2 URL), use it directly
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url;
  }
  
  // If selectedTemplate is provided and is a full URL (R2 URL), use it directly  
  if (selectedTemplate && (selectedTemplate.startsWith('http://') || selectedTemplate.startsWith('https://'))) {
    return selectedTemplate;
  }
  
  // Legacy support: For older local file paths or relative paths
  // During Remotion rendering, we need absolute URLs pointing to the backend server
  const isRendering = typeof window === 'undefined' || process.env.NODE_ENV === 'production';
  const baseUrl = isRendering ? (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') : '';
  
  // If templateUrl is provided as relative path (legacy), convert to absolute for rendering
  if (url && url.startsWith('/ugc/videos/')) {
    return `${baseUrl}${url}`;
  }
  
  // If selectedTemplate looks like a filename (legacy)
  if (selectedTemplate && !selectedTemplate.startsWith('http')) {
    let filename = selectedTemplate;
    
    // Handle template naming patterns (legacy)
    if (selectedTemplate.startsWith('template')) {
      const templateNumber = selectedTemplate.replace('template', '');
      filename = `${templateNumber}.mp4`;
    } else if (!selectedTemplate.includes('.')) {
      filename = `${selectedTemplate}.mp4`;
    }
    
    return `${baseUrl}/ugc/videos/${filename}`;
  }
  
  // If url is provided, clean it and use appropriate base (legacy)
  if (url) {
    let cleanUrl = url;
    if (cleanUrl.startsWith('/ugc/videos/')) {
      return `${baseUrl}${cleanUrl}`;
    } else if (cleanUrl.startsWith('ugc/videos/')) {
      cleanUrl = `/${cleanUrl}`;
    } else if (cleanUrl.startsWith('/')) {
      cleanUrl = `/ugc/videos${cleanUrl}`;
    } else {
      cleanUrl = `/ugc/videos/${cleanUrl}`;
    }
    
    return `${baseUrl}${cleanUrl}`;
  }
  
  // Final fallback - use video 1.mp4 (legacy)
  return `${baseUrl}/ugc/videos/1.mp4`;
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
  templateUrl,
  onDurationFound,
  musicStartTime,
  musicEndTime,
}: VideoCompositionProps) => {
  const { width, height, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const [videoError, setVideoError] = useState<string | null>(null);

  // Transform the video URL with R2 support - memoized to prevent infinite loops
  const transformedTemplateUrl = useMemo(() => {
    console.log('🔄 transformVideoUrl called (should only happen when templateUrl or selectedTemplate changes)', { templateUrl, selectedTemplate });
    return transformVideoUrl(templateUrl, selectedTemplate);
  }, [templateUrl, selectedTemplate]);

  // console.log('VideoComposition render with:', {
  //   selectedTemplate,
  //   templateUrl,
  //   transformedTemplateUrl,
  //   text,
  //   textPosition,
  //   frame,
  //   durationInFrames
  // });

  // Simple effect to notify about duration (without delayRender)
  useEffect(() => {
    if (onDurationFound) {
      // Use the configured duration from Remotion config
      const estimatedDuration = durationInFrames / 30; // 30 FPS
      onDurationFound(estimatedDuration);
    }
  }, [durationInFrames, onDurationFound]);

  // Simplified text animation - fade in over first 15 frames for better performance
  const textOpacity = interpolate(frame, [0, 15], [0, 1], {
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
      // Performance optimizations for text rendering
      willChange: 'opacity, transform', // Hint for GPU acceleration
      backfaceVisibility: 'hidden', // Reduce rendering artifacts
      WebkitFontSmoothing: 'antialiased', // Better text rendering
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

  // If there's a video error, show error message with debugging info
  if (videoError) {
    return (
      <AbsoluteFill>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#333',
          color: 'white',
          fontSize: '18px',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div>
            <h3 style={{ color: '#ff6b6b', marginBottom: '15px' }}>Video Error</h3>
            <p style={{ fontSize: '14px', marginBottom: '15px', color: '#ffd93d' }}>
              {videoError}
            </p>
            <div style={{ fontSize: '12px', opacity: 0.8, textAlign: 'left', maxWidth: '600px' }}>
              <p><strong>Debug Info:</strong></p>
              <p>• Selected Template: {selectedTemplate}</p>
              <p>• Template URL: {templateUrl || 'Not provided'}</p>
              <p>• Transformed URL: {transformedTemplateUrl}</p>
              <p>• URL Type: {transformedTemplateUrl.startsWith('https://') ? 'R2 Cloud URL' : 'Legacy Local URL'}</p>
              <br />
              <p><strong>Common fixes:</strong></p>
              <p>1. Check if the video file exists in R2 bucket</p>
              <p>2. Verify R2 bucket CORS settings allow your domain</p>
              <p>3. Test URL directly in browser: <br/><code>{transformedTemplateUrl}</code></p>
              <p>4. Check R2 public access permissions</p>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

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
        startFrom={0}
        endAt={durationInFrames} // Use the configured duration
        onError={(error) => {
          console.error('Remotion Video component error:', error);
          setVideoError(`Remotion Video component error: ${error.message || error}`);
        }}
        // Performance optimizations for smooth playback
        preload="auto" // Changed from "metadata" to "auto" for faster playback
        crossOrigin="anonymous" // Enable CORS for R2 videos
        playsInline={true} // Better mobile performance
      />

      {/* Background Music */}
      {musicUrl && (
        <Audio
          src={musicUrl}
          volume={musicVolume}
          startFrom={musicStartTime ? Math.floor(musicStartTime * 30) : 0}
          endAt={musicEndTime ? Math.floor(musicEndTime * 30) : undefined}
        />
      )}

      {/* Text Overlay */}
      <AbsoluteFill>
        <div style={getTextStyles()}>
          {text}
        </div>
      </AbsoluteFill>

      {/* Optional: Add subtle vignette effect - simplified for better performance */}
      <AbsoluteFill>
        <div
          style={{
            background: 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.2) 100%)',
            width: '100%',
            height: '100%',
            willChange: 'transform', // Hint for GPU acceleration
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};