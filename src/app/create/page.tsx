'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '@remotion/player';
import { VideoComposition } from '@/components/remotion/videoComposition';
import { TextEditor } from '@/components/remotion/texteditor';
import { PositionSelector } from '@/components/remotion/positionselector';
import { MusicSelector } from '@/components/remotion/musicselector';
import { VideoSelector } from '@/components/ui/video-selector';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { videoRenderingClient } from '@/utils/videoRenderingClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ErrorBoundary, MusicErrorBoundary, VideoErrorBoundary } from '@/components/ui/ErrorBoundary';
import { SessionLoading } from '@/components/ui/LoadingStates';
import { KeyboardShortcutsHelp, useShortcutsHelp, ShortcutsHelpButton } from '@/components/ui/KeyboardShortcutsHelp';
import { useEditorState, useMusicState, useVideoState } from '@/hooks/useEditorState';
import { useMusicKeyboardShortcuts, useEditorKeyboardShortcuts, useAriaLiveRegion } from '@/hooks/useKeyboardShortcuts';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Define the video parameters interface
export interface VideoParams {
  selectedTemplate: string;
  text: string;
  textPosition: 'top' | 'center' | 'bottom';
  textAlign: 'left' | 'center' | 'right';
  fontSize: number;
  textColor: string;
  textOpacity: number;
  musicUrl?: string;
  musicVolume: number;
  // New trimming parameters
  musicStartTime?: number;
  musicEndTime?: number;
}

// Video interface from the selector
interface Video {
  id: string;
  name: string;
  url: string;
  previewUrl?: string; // Added for optimized preview videos
  thumbnailUrl?: string; // Added for R2 thumbnails
  size: number;
  filename: string;
}

export default function CreatePage() {
  const router = useRouter();
  
  // Use the new state management hooks
  const editorState = useEditorState();
  const musicState = useMusicState(editorState);
  const videoState = useVideoState(editorState);
  const { announce } = useAriaLiveRegion();
  const shortcutsHelp = useShortcutsHelp();
  
  // Legacy state for compatibility (gradually migrate these)
  const { selectedVideo, videoParams } = editorState;
  
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderId, setRenderId] = useState<string | null>(null);
  const [renderStatus, setRenderStatus] = useState<'idle' | 'rendering' | 'completed' | 'failed'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [actualVideoDuration, setActualVideoDuration] = useState<number>(5); // Default to 30 seconds

  // Handle video selection from VideoSelector
  const handleVideoSelect = (video: Video) => {
    console.log('handleVideoSelect called with:', video);
    console.log('editorState.setSelectedVideo:', typeof editorState.setSelectedVideo);
    editorState.setSelectedVideo(video);
    console.log('Selected video:', video);
  };

  // Create template object from selected video
  const template = selectedVideo ? {
    id: selectedVideo.id,
    name: `Video ${selectedVideo.id}`,
    url: selectedVideo.url, // Original high-quality URL for final rendering
    previewUrl: selectedVideo.previewUrl || selectedVideo.url, // Optimized preview URL for player, fallback to original
    duration: actualVideoDuration,
    thumbnail: selectedVideo.thumbnailUrl || `/images/${selectedVideo.id}.png` // Use R2 thumbnail or fallback
  } : null;

  // Handle when actual video duration is found
  const handleDurationFound = (duration: number) => {
    console.log('Actual video duration found:', duration, 'seconds');
    setActualVideoDuration(duration);
  };

  // Check video rendering server status on mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const health = await videoRenderingClient.checkHealth();
        if (health.status === 'ok') {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
          toast.error('Video rendering server is not responding');
        }
      } catch (error) {
        console.error('Server health check failed:', error);
        setServerStatus('offline');
        toast.error('Cannot connect to video rendering server. Please make sure it\'s running on port 3001.');
      }
    };

    checkServerStatus();
  }, []);

  // Test video accessibility when video is selected - DISABLED to prevent infinite loops
  // TODO: Re-enable with proper throttling/debouncing
  // useEffect(() => {
  //   if (!selectedVideo) return;
  //   
  //   const testVideoAccess = async () => {
  //     try {
  //       console.log('Testing video accessibility:', selectedVideo.url);
  //       const response = await fetch(selectedVideo.url, { method: 'HEAD' });
  //       console.log('Video test result:', { 
  //         url: selectedVideo.url, 
  //         status: response.status, 
  //         statusText: response.statusText,
  //         contentType: response.headers.get('content-type')
  //       });
  //       
  //       if (!response.ok) {
  //         console.error('Video file not accessible:', response.status, response.statusText);
  //         toast.error(`Video file not accessible: ${selectedVideo.url} (${response.status})`);
  //       }
  //     } catch (error) {
  //       console.error('Video accessibility test failed:', error);
  //       toast.error(`Video file test failed: ${selectedVideo.url}`);
  //     }
  //   };
  //
  //   testVideoAccess();
  // }, [selectedVideo]);

  // Handle text change
  const handleTextChange = (text: string) => {
    editorState.updateVideoParams({ text });
  };

  // Handle text position change
  const handlePositionChange = (textPosition: 'top' | 'center' | 'bottom') => {
    editorState.updateVideoParams({ textPosition });
  };

  // Handle text alignment change
  const handleAlignmentChange = (textAlign: 'left' | 'center' | 'right') => {
    editorState.updateVideoParams({ textAlign });
  };

  // Handle font size change
  const handleFontSizeChange = (fontSize: number) => {
    editorState.updateVideoParams({ fontSize });
  };

  // Handle text color change
  const handleColorChange = (textColor: string) => {
    editorState.updateVideoParams({ textColor });
  };

  // Handle text opacity change
  const handleOpacityChange = (textOpacity: number) => {
    editorState.updateVideoParams({ textOpacity });
  };

  // Handle music selection
  const handleMusicSelect = (musicUrl?: string) => {
    editorState.updateVideoParams({ musicUrl });
  };

  // Handle music volume change
  const handleVolumeChange = (musicVolume: number) => {
    editorState.updateVideoParams({ musicVolume });
  };

  // Handle music trimming change
  const handleTrimChange = (startTime: number, endTime: number) => {
    musicState.handleTrimChange(startTime, endTime);
    announce(`Audio trimmed to ${Math.round(endTime - startTime)} seconds`);
  };

  // Handle video rendering
  const handleRenderVideo = async () => {
    if (serverStatus !== 'online') {
      toast.error('Video rendering server is not available. Please check if it\'s running.');
      return;
    }
    
    if (!template) {
      toast.error('Please select a video template first.');
      return;
    }
    
    setIsRendering(true);
    setRenderProgress(0);
    setRenderStatus('rendering');
    setDownloadUrl(null);
    
    try {
      // Start the render using original high-quality video URL
      const renderTemplate = {
        ...template,
        url: template.url // Ensure we use the original high-quality URL for rendering
      };
      const result = await videoRenderingClient.startRender(videoParams, renderTemplate);
      
      if (result.success && result.renderId) {
        setRenderId(result.renderId);
        toast.success('Video rendering started!');
        
        // Wait for completion with progress updates
        const finalStatus = await videoRenderingClient.waitForRender(
          result.renderId,
          (progress) => {
            setRenderProgress(progress);
            console.log(`Render progress: ${progress}%`);
          },
          1500 // Poll every 1.5 seconds for more responsive UI
        );
        
        if (finalStatus.success) {
          if (finalStatus.status === 'completed') {
            setRenderStatus('completed');
            setRenderProgress(100);
            if (finalStatus.downloadUrl) {
              const fullDownloadUrl = videoRenderingClient.getDownloadUrl(finalStatus.downloadUrl);
              setDownloadUrl(fullDownloadUrl);
            }
            toast.success('Video rendering complete! Click Download to get your video.');
          } else if (finalStatus.status === 'failed') {
            setRenderStatus('failed');
            toast.error(finalStatus.error || 'Video rendering failed. Please try again.');
          }
        } else {
          setRenderStatus('failed');
          toast.error(finalStatus.error || 'Failed to get render status');
        }
      } else {
        setRenderStatus('failed');
        toast.error(result.error || 'Failed to start rendering');
      }
    } catch (error) {
      console.error('Error rendering video:', error);
      setRenderStatus('failed');
      toast.error('An error occurred while rendering the video');
    } finally {
      setIsRendering(false);
    }
  };

  // Handle video download
  const handleDownloadVideo = async () => {
    if (!downloadUrl) {
      toast.error('Download URL not available');
      return;
    }
    
    try {
      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `video_${renderId || Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started!');
    } catch (error) {
      console.error('Error downloading video:', error);
      toast.error('Error downloading video. Please try again.');
    }
  };

  // Reset render state
  const handleResetRender = () => {
    setRenderStatus('idle');
    setRenderProgress(0);
    setRenderId(null);
    setDownloadUrl(null);
    setIsRendering(false);
  };

  // Setup keyboard shortcuts
  const musicShortcuts = useMusicKeyboardShortcuts({
    onVolumeUp: () => {
      const newVolume = Math.min(1, videoParams.musicVolume + 0.1);
      musicState.handleVolumeChange(newVolume);
      announce(`Volume increased to ${Math.round(newVolume * 100)}%`);
    },
    onVolumeDown: () => {
      const newVolume = Math.max(0, videoParams.musicVolume - 0.1);
      musicState.handleVolumeChange(newVolume);
      announce(`Volume decreased to ${Math.round(newVolume * 100)}%`);
    },
    onToggleTrimmer: () => {
      musicState.handleTrimmerToggle(!musicState.showTrimmer);
      announce(musicState.showTrimmer ? 'Audio trimmer hidden' : 'Audio trimmer shown');
    },
    onResetTrim: () => {
      if (musicState.musicUrl) {
        musicState.handleTrimChange(0, musicState.audioDuration);
        announce('Audio trim reset to full track');
      }
    },
    onSave: () => {
      editorState.saveSession();
      announce('Session saved');
    },
  });

  const editorShortcuts = useEditorKeyboardShortcuts({
    onSave: () => {
      editorState.saveSession();
      announce('Session saved');
    },
    onReset: () => {
      editorState.resetToDefault();
      announce('Editor reset to default state');
    },
    onExport: handleRenderVideo,
  });

  // Combine all shortcuts for help display
  const allShortcuts = [...musicShortcuts.shortcuts, ...editorShortcuts.shortcuts];

  // Show loading screen during initial session load
  if (editorState.isLoading) {
    return <SessionLoading />;
  }

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-background">
        {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI UGC Studio
          </h1>
              <p className="text-muted-foreground text-sm">Create viral content in minutes</p>
            </div>
            
            {/* Server Status & Theme Toggle */}
            <div className="flex items-center gap-3">
          {serverStatus === 'online' && (
                <Badge variant="outline" className="border-green-500/50 text-green-600 bg-green-500/10">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Server Online
                </Badge>
          )}
          {serverStatus === 'offline' && (
                <Badge variant="outline" className="border-red-500/50 text-red-600 bg-red-500/10">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  Server Offline
                </Badge>
              )}
              {serverStatus === 'checking' && (
                <Badge variant="outline" className="border-yellow-500/50 text-yellow-600 bg-yellow-500/10">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                  Checking...
                </Badge>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Panel Layout */}
      <div className="w-full mx-auto p-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
          
          {/* Left Panel - Video Preview */}
          <div className="col-span-6">
            <Card className="h-full border-0 shadow-xl bg-card/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-foreground">Video Preview</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(actualVideoDuration)}s
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                        {template?.name}
                    </Badge>
                      </div>
                </div>
              </CardHeader>
                            <CardContent className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm mx-auto">
                  <div className="aspect-[9/16] bg-gradient-to-br from-muted to-card rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border">
                    {selectedVideo && template ? (
                      <VideoErrorBoundary>
                        <Player
                        component={VideoComposition}
                        inputProps={{
                          selectedTemplate: videoParams.selectedTemplate,
                          text: videoParams.text,
                          textPosition: videoParams.textPosition,
                          textAlign: videoParams.textAlign,
                          fontSize: videoParams.fontSize,
                          textColor: videoParams.textColor,
                          textOpacity: videoParams.textOpacity,
                          musicUrl: videoParams.musicUrl,
                          musicVolume: videoParams.musicVolume,
                          musicStartTime: videoParams.musicStartTime,
                          musicEndTime: videoParams.musicEndTime,
                          templateUrl: template.previewUrl, // Use optimized preview for smooth playback
                          onDurationFound: handleDurationFound,
                        }}
                        durationInFrames={Math.round((template.duration || 10) * 30)}
                        compositionWidth={540} // Reduced from 1080 for better preview performance
                        compositionHeight={960} // Reduced from 1920 for better preview performance
                        fps={60}
                        className="w-full h-full"
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                        controls={false}
                        loop={true}
                        autoPlay={true}
                        showVolumeControls={false}
                        allowFullscreen={false}
                        clickToPlay={false}
                        spaceKeyToPlayOrPause={false}
                        playbackRate={1}
                        initialFrame={0}
                        doubleClickToFullscreen={false}
                        moveToBeginningWhenEnded={false}
                        renderLoading={() => (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <div className="animate-pulse text-foreground">Loading...</div>
                          </div>
                        )}
                        errorFallback={({ error }) => (
                          <div className="w-full h-full flex items-center justify-center bg-red-500/10 text-red-600 p-4">
                            <div className="text-center">
                              <div className="text-sm">Preview Error</div>
                              <div className="text-xs opacity-75 mt-1">{error.message}</div>
                            </div>
                          </div>
                        )}
                        // Hardware acceleration and performance hints
                        numberOfSharedAudioTags={1} // Reduce audio context overhead
                        alwaysShowControls={false}
                        showPosterWhenUnplayed={false}
                        showPosterWhenPaused={false}
                        showPosterWhenEnded={false}
                      />
                      </VideoErrorBoundary>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-foreground p-6">
                          <div className="w-16 h-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Select a Video</h3>
                          <p className="text-sm text-muted-foreground">Choose a video template from the Video tab to start creating</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Customization */}
          <div className="col-span-6">
            <Card className="h-full border-0 shadow-xl bg-card/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-foreground">Customize</CardTitle>
                <p className="text-sm text-muted-foreground">Make it your own</p>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <Tabs defaultValue="video" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-5 mb-4 h-10 p-1 bg-muted rounded-lg">
                    <TabsTrigger value="video" className="text-xs px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Video</TabsTrigger>
                    <TabsTrigger value="text" className="text-xs px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Text</TabsTrigger>
                    <TabsTrigger value="position" className="text-xs px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Position</TabsTrigger>
                    <TabsTrigger value="music" className="text-xs px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Music</TabsTrigger>
                    <TabsTrigger value="render" className="text-xs px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Render</TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="video" className="h-full m-0">
                      <ScrollArea className="h-full">
                        <div className="space-y-6 pr-2">
                          <VideoSelector
                            selectedVideo={selectedVideo?.filename || null}
                            onVideoSelect={handleVideoSelect}
                            className="border-0 p-0"
                          />
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="text" className="h-full m-0">
                      <ScrollArea className="h-full">
                        <div className="space-y-6 pr-2">
              <TextEditor 
                text={videoParams.text}
                fontSize={videoParams.fontSize}
                textColor={videoParams.textColor}
                textOpacity={videoParams.textOpacity}
                onTextChange={handleTextChange}
                onFontSizeChange={handleFontSizeChange}
                onColorChange={handleColorChange}
                onOpacityChange={handleOpacityChange}
              />
            </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="position" className="h-full m-0">
                      <ScrollArea className="h-full">
                        <div className="space-y-6 pr-2">
              <PositionSelector
                position={videoParams.textPosition}
                align={videoParams.textAlign}
                            onPositionChange={handlePositionChange}
                onAlignChange={handleAlignmentChange}
              />
            </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="music" className="h-full m-0">
                      <ScrollArea className="h-full">
                        <div className="space-y-6 pr-2 overflow-y-auto mx-auto">
                          <MusicErrorBoundary>
                            <MusicSelector 
                              musicUrl={videoParams.musicUrl}
                              volume={videoParams.musicVolume}
                              onMusicChange={handleMusicSelect}
                              onVolumeChange={handleVolumeChange}
                              onTrimChange={handleTrimChange}
                              trimStart={videoParams.musicStartTime}
                              trimEnd={videoParams.musicEndTime}
                            />
                          </MusicErrorBoundary>
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="render" className="h-full m-0">
                      <ScrollArea className="h-full">
                        <div className="space-y-6 pr-2">
              {renderStatus === 'rendering' ? (
                            <div className="space-y-6">
                              <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-4 relative">
                                  <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600">{renderProgress}%</span>
                  </div>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">Rendering Your Video</h3>
                                <p className="text-muted-foreground text-sm">This usually takes 2-5 minutes</p>
                              </div>
                              <Progress value={renderProgress} className="w-full h-2" />
                </div>
              ) : renderStatus === 'completed' ? (
                            <div className="text-center space-y-6">
                              <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">Video Ready!</h3>
                                <p className="text-muted-foreground text-sm mb-6">Your viral content is ready to download</p>
                  </div>
                              <div className="space-y-3">
                    <Button 
                      onClick={handleDownloadVideo}
                      disabled={!downloadUrl}
                                  className="w-full bg-blue-600 hover:bg-blue-700"
                                  size="lg"
                    >
                      Download Video
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleResetRender}
                                  className="w-full"
                    >
                                  Create Another
                    </Button>
                  </div>
                </div>
              ) : renderStatus === 'failed' ? (
                            <div className="text-center space-y-6">
                              <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">Render Failed</h3>
                                <p className="text-muted-foreground text-sm mb-6">Something went wrong. Please try again.</p>
                  </div>
                              <div className="space-y-3">
                    <Button 
                      onClick={handleRenderVideo}
                                  disabled={serverStatus !== 'online'}
                                  className="w-full"
                                  variant="outline"
                    >
                      Try Again
                    </Button>
                    <Button 
                                  variant="ghost" 
                      onClick={handleResetRender}
                                  className="w-full"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              ) : (
                            <div className="space-y-6">
                              <div className="text-center">
                                <div className="w-20 h-20 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h1a1 1 0 011 1v2M7 4h10M7 4v16M17 4v16M17 4V2a1 1 0 011-1h1a1 1 0 011 1v2M5 8h14M5 12h14M5 16h14" />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Render</h3>
                                <p className="text-muted-foreground text-sm mb-6">Create your high-quality MP4 video</p>
                              </div>
                              
                              <div className="bg-muted rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Quality:</span>
                                  <span className="font-medium text-foreground">1080x1920 HD</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Format:</span>
                                  <span className="font-medium text-foreground">MP4 H.264</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Est. Time:</span>
                                  <span className="font-medium text-foreground">2-5 minutes</span>
                                </div>
                              </div>
                              
                  <Button 
                    onClick={handleRenderVideo} 
                                disabled={serverStatus !== 'online'}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                                {serverStatus !== 'online' ? 'Server Offline' : 'Render Video'}
                  </Button>
                </div>
              )}
            </div>
                      </ScrollArea>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        shortcuts={allShortcuts}
        isOpen={shortcutsHelp.isOpen}
        onClose={shortcutsHelp.closeHelp}
      />
      
      {/* Floating Help Button */}
      <ShortcutsHelpButton onClick={shortcutsHelp.toggleHelp} />
      
      {/* Session Status Indicator */}
      {editorState.hasUnsavedChanges && (
        <div className="fixed bottom-6 left-6 px-3 py-2 bg-yellow-500 text-white text-sm rounded-lg shadow-lg">
          Unsaved changes
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}