import React, { useEffect, useState, useRef } from 'react';
import { AbsoluteFill, Video, Audio, useVideoConfig, interpolate, useCurrentFrame, delayRender, continueRender } from 'remotion';

// Simple cache to store video metadata and prevent repeated loading
const videoMetadataCache = new Map<string, { duration: number; width: number; height: number }>();

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
}

// Utility function to transform video URL for Remotion rendering
const transformVideoUrl = (url?: string, selectedTemplate?: string): string => {
  console.log('Transform video URL called with:', { url, selectedTemplate });
  
  // If templateUrl is provided and is a full URL, use it
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    console.log('Using provided templateUrl (full URL):', url);
    return url;
  }
  
  // If templateUrl is provided as relative path (from frontend), use it directly
  if (url && url.startsWith('/ugc/videos/')) {
    console.log('Using provided templateUrl (relative path):', url);
    return url;
  }
  
  // If selectedTemplate is provided and looks like a filename
  if (selectedTemplate && !selectedTemplate.startsWith('http')) {
    let filename = selectedTemplate;
    
    // Handle template naming patterns
    if (selectedTemplate.startsWith('template')) {
      // Convert 'template1' to '1.mp4', 'template2' to '2.mp4', etc.
      const templateNumber = selectedTemplate.replace('template', '');
      filename = `${templateNumber}.mp4`;
    } else if (!selectedTemplate.includes('.')) {
      // If it's just a number or name without extension, add .mp4
      filename = `${selectedTemplate}.mp4`;
    }
    
    // Use frontend URL (served by Next.js from public folder)
    const videoUrl = `/ugc/videos/${filename}`;
    console.log('Using selectedTemplate to construct frontend URL:', videoUrl);
    return videoUrl;
  }
  
  // If selectedTemplate is already a full URL
  if (selectedTemplate && (selectedTemplate.startsWith('http://') || selectedTemplate.startsWith('https://'))) {
    console.log('Using selectedTemplate (full URL):', selectedTemplate);
    return selectedTemplate;
  }
  
  // If url is provided, clean it and use frontend path
  if (url) {
    let cleanUrl = url;
    if (cleanUrl.startsWith('/ugc/videos/')) {
      // Already a frontend path, use as is
      console.log('Using frontend path:', cleanUrl);
      return cleanUrl;
    } else if (cleanUrl.startsWith('ugc/videos/')) {
      cleanUrl = `/${cleanUrl}`;
    } else if (cleanUrl.startsWith('/')) {
      cleanUrl = `/ugc/videos${cleanUrl}`;
    } else {
      cleanUrl = `/ugc/videos/${cleanUrl}`;
    }
    
    console.log('Constructed frontend URL from path:', cleanUrl);
    return cleanUrl;
  }
  
  // Fallback - try to use selectedTemplate as filename with frontend path
  if (selectedTemplate) {
    let filename = selectedTemplate;
    
    if (selectedTemplate.startsWith('template')) {
      const templateNumber = selectedTemplate.replace('template', '');
      filename = `${templateNumber}.mp4`;
    } else if (!selectedTemplate.includes('.')) {
      filename = `${selectedTemplate}.mp4`;
    }
    
    const fallbackUrl = `/ugc/videos/${filename}`;
    console.log('Using selectedTemplate as fallback frontend URL:', fallbackUrl);
    return fallbackUrl;
  }
  
  // Final fallback - use frontend video 1.mp4
  const defaultUrl = '/ugc/videos/1.mp4';
  console.log('Using default fallback frontend URL:', defaultUrl);
  return defaultUrl;
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
}: VideoCompositionProps) => {
  const { width, height, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const loadingRef = useRef<boolean>(false);

  // Transform the video URL with better logic
  const transformedTemplateUrl = transformVideoUrl(templateUrl, selectedTemplate);

  console.log('VideoComposition render with:', {
    selectedTemplate,
    templateUrl,
    transformedTemplateUrl,
    text,
    textPosition,
    frame,
    durationInFrames
  });

  // Enhanced video loading check with proper resource management
  useEffect(() => {
    const handle = delayRender('Loading and validating video');
    let isCleanedUp = false;
    let videoElement: HTMLVideoElement | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    
          const cleanup = () => {
        if (isCleanedUp) return;
        isCleanedUp = true;
        loadingRef.current = false;
        
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        if (videoElement) {
          // Remove all event listeners
          videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
          videoElement.removeEventListener('error', onError);
          videoElement.removeEventListener('loadstart', onLoadStart);
          videoElement.removeEventListener('canplay', onCanPlay);
          
          // Stop loading and clear source
          videoElement.pause();
          videoElement.removeAttribute('src');
          videoElement.load(); // This stops any ongoing loading
          videoElement = null;
        }
      };
    
    const onLoadStart = () => {
      console.log('Video loading started:', transformedTemplateUrl);
    };
    
    const onCanPlay = () => {
      console.log('Video can play:', transformedTemplateUrl);
    };
    
          const onLoadedMetadata = () => {
        if (isCleanedUp || !videoElement) return;
        
        const actualDuration = videoElement.duration;
        const configuredDuration = durationInFrames / 30;
        
        console.log('Video metadata loaded successfully:', {
          src: transformedTemplateUrl,
          actualDuration: actualDuration,
          configuredDuration: configuredDuration,
          durationMismatch: Math.abs(actualDuration - configuredDuration) > 0.5,
          width: videoElement.videoWidth,
          height: videoElement.videoHeight,
          readyState: videoElement.readyState,
          durationInFrames: durationInFrames
        });
        
        // Cache the metadata to prevent repeated loading
        videoMetadataCache.set(transformedTemplateUrl, {
          duration: actualDuration,
          width: videoElement.videoWidth,
          height: videoElement.videoHeight
        });
        
        setVideoDuration(actualDuration);
        
        // Notify parent component about the actual duration (only once)
        if (onDurationFound && actualDuration > 0) {
          onDurationFound(actualDuration);
        }
        
        // Warn if there's a significant duration mismatch
        if (Math.abs(actualDuration - configuredDuration) > 0.5) {
          console.warn(`Duration mismatch detected! Actual: ${actualDuration}s, Configured: ${configuredDuration}s`);
        }
        
        setVideoError(null);
        loadingRef.current = false;
        continueRender(handle);
        cleanup(); // Clean up immediately after success
      };
    
          const onError = (event: Event) => {
        if (isCleanedUp || !videoElement) return;
        
        const error = videoElement.error;
        let errorMessage = 'Unknown video error';
        
        if (error) {
          switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = 'Video loading aborted';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = 'Network error while loading video';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = 'Video decode error - corrupted file or unsupported codec';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'Video format not supported or file not found';
              break;
            default:
              errorMessage = `Media error code ${error.code}: ${error.message}`;
          }
        }

        const fullError = `${errorMessage} (URL: ${transformedTemplateUrl})`;
        console.error('Video loading error:', {
          src: transformedTemplateUrl,
          error: event,
          errorCode: error?.code,
          errorMessage: error?.message,
          interpretedError: errorMessage
        });
        
        setVideoError(fullError);
        loadingRef.current = false;
        continueRender(handle);
        cleanup(); // Clean up after error
      };
    
    const validateAndLoadVideo = async () => {
      try {
        if (isCleanedUp || loadingRef.current) return;
        loadingRef.current = true;
        
        console.log('Starting video validation for:', transformedTemplateUrl);
        
        // Check cache first
        const cachedMetadata = videoMetadataCache.get(transformedTemplateUrl);
        if (cachedMetadata) {
          console.log('Using cached video metadata:', cachedMetadata);
          setVideoDuration(cachedMetadata.duration);
          if (onDurationFound && cachedMetadata.duration > 0) {
            onDurationFound(cachedMetadata.duration);
          }
          setVideoError(null);
          continueRender(handle);
          loadingRef.current = false;
          return;
        }
        
        // Skip URL accessibility check for local files to avoid CORS issues
        // and potential resource exhaustion from repeated HEAD requests
        console.log('No cached metadata found, loading video metadata...');

        // Create video element for metadata loading
        videoElement = document.createElement('video');
        videoElement.preload = 'metadata'; // Only load metadata, not the full video
        videoElement.muted = true; // Ensure it's muted to avoid autoplay issues
        
        // Add event listeners
        videoElement.addEventListener('loadstart', onLoadStart);
        videoElement.addEventListener('canplay', onCanPlay);
        videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
        videoElement.addEventListener('error', onError);

        // Set timeout for loading
        timeoutId = setTimeout(() => {
          if (isCleanedUp) return;
          console.warn('Video loading timeout after 8 seconds');
          const timeoutError = `Video loading timeout: ${transformedTemplateUrl}. This usually means the file doesn't exist or the server isn't responding.`;
          setVideoError(timeoutError);
          continueRender(handle);
          cleanup();
        }, 8000); // Reduced timeout to 8 seconds

        // Start loading - set src last to trigger loading
        videoElement.src = transformedTemplateUrl;
        
              } catch (error) {
          if (isCleanedUp) return;
          console.error('Video validation failed:', error);
          const validationError = `Video validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          setVideoError(validationError);
          loadingRef.current = false;
          continueRender(handle);
          cleanup();
        }
    };

    validateAndLoadVideo();
    
    // Return cleanup function
    return cleanup;
  }, [transformedTemplateUrl, durationInFrames]);

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
              <p>• Expected file location: public/ugc/videos/</p>
              <br />
              <p><strong>Common fixes:</strong></p>
              <p>1. Check if the video file exists</p>
              <p>2. Verify server is serving static files from /ugc path</p>
              <p>3. Test URL directly in browser: <br/><code>{transformedTemplateUrl}</code></p>
              <p>4. Check server CORS settings</p>
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
        endAt={videoDuration ? Math.floor(videoDuration * 30) : durationInFrames} // Use actual duration if available
        onError={(error) => {
          console.error('Remotion Video component error:', error);
          setVideoError(`Remotion Video component error: ${error.message || error}`);
        }}
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