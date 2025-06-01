import React from 'react';
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
  // Additional props for video template
  templateUrl?: string;
}

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
        src={templateUrl}
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