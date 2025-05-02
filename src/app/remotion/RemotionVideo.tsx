import React, { useState, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { VideoComposition } from './VideoComposition';

interface RemotionVideoProps {
  bgMusicUrl?: string;
  duration?: number;
  audioUrl?: string;
  videoUrl?: string;
  videoSequences?: Array<{
    videoUrl: string;
    startFrame: number;
    durationInFrames: number;
  }>;
  images?: Array<{
    imageUrl: string;
    contextText: string;
    startFrame?: number;
    durationInFrames?: number;
  }>;
  captions?: Array<{
    text: string;
    start: number;
    end: number;
  }>;
  captionStyle?: 'default' | 'highlightEachWord' | 'highlightSpokenWord' | 'wordByWord';
  captionPreset?: 'BASIC' | 'REVID' | 'HORMOZI' | 'WRAP 1' | 'WRAP 2' | 'FACELESS' | 'ALL';
  captionAlignment?: 'top' | 'middle' | 'bottom';
  screenRatio?: '1/1' | '16/9' | '9/16' | 'auto';
  strictWordHighlighting?: boolean;
}

export function RemotionVideo({ 
  duration,
  audioUrl, 
  bgMusicUrl,
  videoUrl, 
  videoSequences = [],
  images = [], 
  captions = [], 
  captionStyle = 'default',
  captionPreset = 'BASIC',
  captionAlignment = 'bottom',
  screenRatio = '16/9',
  strictWordHighlighting = true
}: RemotionVideoProps) {
  const playerRef = React.useRef<PlayerRef>(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 1920, height: 1080 });
  const [aspectRatio, setAspectRatio] = useState(16/9);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isLoading, setIsLoading] = useState(videoUrl || videoSequences.length > 0 ? false : true);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  
  // Debug props in RemotionVideo
  React.useEffect(() => {
    console.log('RemotionVideo received props:', { 
      audioUrl, 
      bgMusicUrl, 
      videoUrl, 
      videoSequences,
      images, 
      captions, 
      screenRatio, 
      duration 
    });
  }, [audioUrl, bgMusicUrl, videoUrl, videoSequences, images, captions, screenRatio, duration]);

  // Calculate the total duration in frames based on all media
  const calculateDurationInFrames = () => {
    // If explicit duration is provided, use it
    if (duration) {
      return Math.ceil(duration * 30); // 30fps
    }
    
    // Calculate based on audio duration
    if (videoDuration) {
      return Math.ceil(videoDuration * 30); // 30fps
    }
    
    // Calculate based on video sequences
    if (videoSequences && videoSequences.length > 0) {
      const maxEndFrame = Math.max(
        ...videoSequences.map(seq => seq.startFrame + seq.durationInFrames)
      );
      return maxEndFrame;
    }
    
    // Calculate based on images
    if (images && images.length > 0) {
      const imagesWithFrames = images.filter(img => img.startFrame !== undefined && img.durationInFrames !== undefined);
      if (imagesWithFrames.length > 0) {
        const maxEndFrame = Math.max(
          ...imagesWithFrames.map(img => (img.startFrame || 0) + (img.durationInFrames || 0))
        );
        return maxEndFrame;
      }
      
      // If no frame info, estimate based on number of images (5s each)
      return images.length * 5 * 30;
    }
    
    // Calculate based on captions
    if (captions && captions.length > 0) {
      const maxEndTime = Math.max(...captions.map(caption => caption.end));
      return Math.ceil((maxEndTime / 1000 + 0.5) * 30); // Convert ms to seconds, add 0.5s buffer
    }
    
    // Default duration if nothing else is available
    return 5 * 30; // 5 seconds
  };
  
  // Get duration in frames
  const durationInFrames = calculateDurationInFrames();

  // Update video dimensions and orientation based on screen ratio
  React.useEffect(() => {
    // Default to 16:9 landscape
    let ratio = 16/9;
    let portrait = false;
    
    if (screenRatio === '1/1') {
      ratio = 1;
    } else if (screenRatio === '9/16') {
      ratio = 9/16;
      portrait = true;
    } else if (screenRatio === '16/9') {
      ratio = 16/9;
    }
    
    setAspectRatio(ratio);
    setIsPortrait(portrait);
    
    // Set dimensions based on ratio
    if (portrait) {
      setVideoDimensions({ width: 1080, height: 1920 });
    } else if (screenRatio === '1/1') {
      setVideoDimensions({ width: 1080, height: 1080 });
    } else {
      setVideoDimensions({ width: 1920, height: 1080 });
    }
  }, [screenRatio]);

  // Create a responsive container style based on video orientation
  const containerStyle: React.CSSProperties = isPortrait
    ? {
        width: 'auto',
        height: '100%',
        maxWidth: '100%',
        maxHeight: 'calc(100vh - 4rem)',
        margin: '0 auto',
        aspectRatio: `${aspectRatio}`,
      }
    : {
        width: '100%',
        position: 'relative',
        paddingTop: `${(1 / aspectRatio) * 100}%`,
        overflow: 'hidden',
        maxHeight: 'calc(100vh - 4rem)',
      };

  // Player style to fit within the container
  const playerStyle: React.CSSProperties = isPortrait
    ? {
        width: '100%',
        height: '100%',
      }
    : {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/10 rounded-lg">
        <div className="animate-pulse text-center">
          <div className="h-8 w-8 mx-auto border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div style={containerStyle} className="bg-black rounded-lg overflow-hidden">
        <Player
          ref={playerRef}
          component={VideoComposition}
          inputProps={{
            bgMusicUrl,
            audioUrl,
            videoUrl,
            videoSequences,
            images,
            captions,
            isPortrait,
            captionPreset,
            captionAlignment,
            screenRatio,
            strictWordHighlighting,
            disableCaptions: captions.length === 0,
            captionAnimation: (captionStyle === 'default' ? 'none' :
                             captionStyle === 'highlightEachWord' ? 'highlight' :
                             captionStyle === 'wordByWord' ? 'word-by-word' :
                             captionStyle === 'highlightSpokenWord' ? 'movie-style' : 
                             'none') as 'none' | 'highlight' | 'fade-in' | 'word-by-word' | 'movie-style',
          }}
          durationInFrames={durationInFrames}
          compositionWidth={videoDimensions.width}
          compositionHeight={videoDimensions.height}
          fps={30}
          style={playerStyle}
          controls={true}
          className="remotion-player"
          errorFallback={({ error }) => {
            console.error('Remotion player error:', error);
            return (
              <div className="flex flex-col items-center justify-center h-full bg-black/5 p-4 text-center">
                <p className="text-red-500 mb-2">Error playing video</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
                <button 
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            );
          }}
          clickToPlay={true}
        />
      </div>
    </div>
  );
} 