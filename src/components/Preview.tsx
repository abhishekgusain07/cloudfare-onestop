import { useEffect, useRef, useMemo, useState } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { useEditorStore } from '@/store/editorStore';
import { AbsoluteFill, Sequence, Video } from 'remotion';

interface VideoErrorState {
  [key: string]: {
    hasError: boolean;
    errorMessage: string;
  };
}

const VideoComposition = () => {
  const tracks = useEditorStore((state) => state.tracks);
  const assets = useEditorStore((state) => state.assets);
  const [videoErrors, setVideoErrors] = useState<VideoErrorState>({});

  // Reset errors when tracks or assets change
  useEffect(() => {
    setVideoErrors({});
  }, [tracks, assets]);

  useEffect(() => {
    // Log current tracks and assets for debugging
    console.log('Current tracks:', tracks);
    console.log('Current assets:', assets);
  }, [tracks, assets]);

  const handleVideoError = (clipId: string, error: Error) => {
    console.error(`Error playing video ${clipId}:`, error);
    setVideoErrors(prev => ({
      ...prev,
      [clipId]: {
        hasError: true,
        errorMessage: error.message || 'Error loading video'
      }
    }));
  };

  const validateVideoUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AbsoluteFill>
      {tracks.map((track, trackIndex) => (
        track.clips.map((clip) => {
          const asset = assets.find((a) => a.id === clip.assetId);
          if (!asset) {
            console.warn(`No asset found for clip ${clip.id}`);
            return null;
          }

          // Convert timeline pixels to frames (30fps)
          const startFrame = Math.round(clip.startTime * 30);
          const durationInFrames = Math.round(clip.duration * 30);

          if (asset.type === 'video') {
            console.log(`Rendering video clip:`, {
              clipId: clip.id,
              assetId: asset.id,
              url: asset.url,
              startFrame,
              durationInFrames
            });

            const isValidUrl = validateVideoUrl(asset.url);
            if (!isValidUrl) {
              console.error(`Invalid video URL for clip ${clip.id}:`, asset.url);
              return null;
            }

            console.log(`Attempting to load video for clip ${clip.id}:`, {
              url: asset.url,
              startFrame,
              durationInFrames
            });

            return (
              <Sequence
                key={`${clip.id}-${startFrame}`}
                from={startFrame}
                durationInFrames={durationInFrames}
                name={`Video-${clip.id}`}
              >
                {videoErrors[clip.id]?.hasError ? (
                  <div 
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '20px',
                      textAlign: 'center',
                    }}
                  >
                    <div>Error loading video</div>
                    <div style={{ fontSize: '0.8em', marginTop: '10px', color: '#ff9999' }}>
                      {videoErrors[clip.id]?.errorMessage}
                    </div>
                  </div>
                ) : (
                  <Video
                    src={asset.url}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                    onError={(error) => handleVideoError(clip.id, error)}
                    muted={false}
                    volume={1}
                  />
                )}
              </Sequence>
            );
          } else if (asset.type === 'image') {
            return (
              <Sequence
                key={`${clip.id}-${startFrame}`}
                from={startFrame}
                durationInFrames={durationInFrames}
                name={`Image-${clip.id}`}
              >
                <img
                  src={asset.url}
                  alt=""
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </Sequence>
            );
          }
          return null;
        })
      ))}
    </AbsoluteFill>
  );
};

export const Preview = () => {
  const isPlaying = useEditorStore((state) => state.isPlaying);
  const currentTime = useEditorStore((state) => state.currentTime);
  const setCurrentTime = useEditorStore((state) => state.setCurrentTime);
  const setIsPlaying = useEditorStore((state) => state.setIsPlaying);
  const tracks = useEditorStore((state) => state.tracks);
  const playerRef = useRef<PlayerRef>(null);

  // Calculate total duration from all tracks and ensure it's an integer
  const totalDurationInFrames = useMemo(() => {
    if (!tracks.length) return 300; // Default 10 seconds if no tracks
    
    const maxDuration = Math.ceil(
      Math.max(
        ...tracks.flatMap(track =>
          track.clips.map(clip => Math.ceil((clip.startTime + clip.duration) * 30))
        ),
        300 // Minimum duration of 10 seconds
      )
    );
    return maxDuration;
  }, [tracks]);

  return (
    <div className="w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <Player
        ref={playerRef}
        component={VideoComposition}
        durationInFrames={totalDurationInFrames}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={30}
        style={{
          width: '100%',
          height: '100%',
        }}
        controls
        autoPlay={isPlaying}
        initiallyShowControls
        inputProps={{
          currentTime,
          onTimeUpdate: (time: number) => setCurrentTime(time),
          onPlay: () => setIsPlaying(true),
          onPause: () => setIsPlaying(false),
        }}
        loop
        showVolumeControls
        showPlaybackRateControl
      />
    </div>
  );
}; 