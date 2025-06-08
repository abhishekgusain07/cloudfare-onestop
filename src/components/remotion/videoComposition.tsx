import React, { useEffect, useState } from 'react';
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
  templateUrl?: string;
}

// Utility function to transform video URL for Remotion rendering
const transformVideoUrl = (url?: string, selectedTemplate?: string): string => {
  console.log('Transform video URL called with:', { url, selectedTemplate });
  
  // If templateUrl is provided and is a full URL, use it
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    console.log('Using provided templateUrl (full URL):', url);
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
    
    const videoUrl = `http://localhost:3001/ugc/videos/${filename}`;
    console.log('Using selectedTemplate to construct URL:', videoUrl);
    return videoUrl;
  }
  
  // If selectedTemplate is already a full URL
  if (selectedTemplate && (selectedTemplate.startsWith('http://') || selectedTemplate.startsWith('https://'))) {
    console.log('Using selectedTemplate (full URL):', selectedTemplate);
    return selectedTemplate;
  }
  
  // If url is a relative path, construct full URL
  if (url) {
    let cleanUrl = url;
    if (cleanUrl.startsWith('/ugc/videos/')) {
      cleanUrl = cleanUrl.replace('/ugc/videos/', '');
    } else if (cleanUrl.startsWith('ugc/videos/')) {
      cleanUrl = cleanUrl.replace('ugc/videos/', '');
    } else if (cleanUrl.startsWith('/')) {
      cleanUrl = cleanUrl.substring(1);
    }
    
    // Handle template naming patterns in URL
    if (cleanUrl.startsWith('template')) {
      const templateNumber = cleanUrl.replace('template', '');
      cleanUrl = `${templateNumber}.mp4`;
    } else if (!cleanUrl.includes('.')) {
      // Add .mp4 extension if not present
      cleanUrl = `${cleanUrl}.mp4`;
    }
    
    const constructedUrl = `http://localhost:3001/ugc/videos/${cleanUrl}`;
    console.log('Constructed URL from relative path:', constructedUrl);
    return constructedUrl;
  }
  
  // Fallback - try to use selectedTemplate as filename
  if (selectedTemplate) {
    let filename = selectedTemplate;
    
    if (selectedTemplate.startsWith('template')) {
      const templateNumber = selectedTemplate.replace('template', '');
      filename = `${templateNumber}.mp4`;
    } else if (!selectedTemplate.includes('.')) {
      filename = `${selectedTemplate}.mp4`;
    }
    
    const fallbackUrl = `http://localhost:3001/ugc/videos/${filename}`;
    console.log('Using selectedTemplate as fallback filename:', fallbackUrl);
    return fallbackUrl;
  }
  
  // Final fallback - use video 1.mp4 (since you mentioned you have 1.mp4)
  const defaultUrl = 'http://localhost:3001/ugc/videos/1.mp4';
  console.log('Using default fallback URL:', defaultUrl);
  return defaultUrl;
};

// Function to check if video URL is accessible and valid  
const checkVideoUrl = async (url: string): Promise<{ accessible: boolean; error?: string }> => {
  try {
    console.log('Checking video URL accessibility:', url);
    
    // Try to fetch with a more permissive approach
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'cors', // Explicitly set CORS mode
      cache: 'no-cache'
    });
    
    const contentType = response.headers.get('content-type');
    console.log('Video URL check result:', { 
      url, 
      status: response.status, 
      statusText: response.statusText,
      contentType,
      ok: response.ok 
    });
    
    if (!response.ok) {
      return { 
        accessible: false, 
        error: `HTTP ${response.status}: ${response.statusText}` 
      };
    }
    
    // Check if it's a video file
    if (contentType && contentType.startsWith('video/')) {
      return { accessible: true };
    }
    
    // If no content-type header, check file extension
    const hasVideoExtension = /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
    if (hasVideoExtension) {
      return { accessible: true };
    }
    
    return { 
      accessible: false, 
      error: `Invalid content type: ${contentType || 'unknown'}` 
    };
    
  } catch (error) {
    console.error('Video URL accessibility check failed:', error);
    return { 
      accessible: false, 
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
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
}: VideoCompositionProps) => {
  const { width, height, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const [videoError, setVideoError] = useState<string | null>(null);

  // Transform the video URL with better logic
  const transformedTemplateUrl = transformVideoUrl(templateUrl, selectedTemplate);

  console.log('VideoComposition render with:', {
    selectedTemplate,
    templateUrl,
    transformedTemplateUrl,
    text,
    textPosition
  });

  // Enhanced video loading check with better error handling
  useEffect(() => {
    const handle = delayRender('Loading and validating video');
    
    const validateAndLoadVideo = async () => {
      try {
        console.log('Starting video validation for:', transformedTemplateUrl);
        
        // First, check if the URL is accessible
        const urlCheck = await checkVideoUrl(transformedTemplateUrl);
        
        if (!urlCheck.accessible) {
          const errorMsg = `Video not accessible: ${transformedTemplateUrl}. ${urlCheck.error || 'Unknown error'}`;
          console.error(errorMsg);
          setVideoError(errorMsg);
          continueRender(handle);
          return;
        }

        console.log('Video URL is accessible, creating video element...');

        // Create video element for detailed validation
        const videoElement = document.createElement('video');
        videoElement.src = transformedTemplateUrl;
        videoElement.crossOrigin = 'anonymous';
        videoElement.preload = 'metadata';
        
        const onLoadedMetadata = () => {
          console.log('Video metadata loaded successfully:', {
            src: transformedTemplateUrl,
            duration: videoElement.duration,
            width: videoElement.videoWidth,
            height: videoElement.videoHeight,
            readyState: videoElement.readyState
          });
          setVideoError(null);
          continueRender(handle);
        };
        
        const onError = (event: Event) => {
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
          continueRender(handle);
        };

        videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
        videoElement.addEventListener('error', onError);

        // Reduced timeout and better error message
        const timeout = setTimeout(() => {
          console.warn('Video loading timeout after 10 seconds');
          const timeoutError = `Video loading timeout: ${transformedTemplateUrl}. This usually means the file doesn't exist or the server isn't responding.`;
          setVideoError(timeoutError);
          continueRender(handle);
        }, 10000); // 10 second timeout

        // Cleanup function
        return () => {
          clearTimeout(timeout);
          videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
          videoElement.removeEventListener('error', onError);
          videoElement.src = ''; // Clear the src to stop loading
        };
        
      } catch (error) {
        console.error('Video validation failed:', error);
        const validationError = `Video validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        setVideoError(validationError);
        continueRender(handle);
      }
    };

    validateAndLoadVideo();
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