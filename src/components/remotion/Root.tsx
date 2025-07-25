import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition } from './videoComposition';
import { SlideStillComposition } from './SlideStillComposition';

// Define interface for component props
interface RemotionRootProps {
  captions?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  disableCaptions?: boolean;
  audioDuration?: number;
}

export const RemotionRoot: React.FC<RemotionRootProps> = ({ 
  captions = [], 
  disableCaptions = false,
  audioDuration = 0
}) => {
  // Calculate duration based on captions, audio duration, or use default
  const calculateDuration = () => {
    // If captions are disabled, use audio duration (converted from seconds to frames)
    if (disableCaptions && audioDuration) {
      // Add a small buffer (1 second) to the end
      return Math.ceil((audioDuration + 1) * 30); // Assuming 30fps
    }
    
    // If captions are enabled but empty, use default duration
    if (!captions || captions.length === 0) {
      return 150; // Default 5 seconds (150 frames at 30fps) - will be overridden by actual video duration
    }
    
    // Use captions for duration calculation
    const maxEndTime = Math.max(...captions.map(caption => caption.end));
    return Math.ceil((maxEndTime / 1000 + 0.5) * 30); // Convert ms to seconds, add 0.5s buffer, convert to frames
  };

  const durationInFrames = calculateDuration();

  return (
    <>
      <Composition
        id="VideoComposition"
        component={VideoComposition as any}
        durationInFrames={audioDuration * 30 || durationInFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          selectedTemplate: '', // No default template - will be set dynamically
          text: 'Your AI-Generated Video',
          textPosition: 'bottom',
          textAlign: 'center',
          fontSize: 36,
          textColor: '#FFFFFF',
          musicVolume: 0.5,
          musicUrl: undefined,
          templateUrl: undefined, // Will be set dynamically when video is selected
        }}
      />
      <Composition
        id="SlideStill"
        component={SlideStillComposition as any}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          imageUrl: '',
          textElements: [],
        }}
      />
    </>
  );
};