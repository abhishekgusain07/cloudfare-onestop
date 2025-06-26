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
}

// Video interface from the selector
interface Video {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string; // Added for R2 thumbnails
  size: number;
  filename: string;
}

export default function CreatePage() {
  const router = useRouter();
  const [videoParams, setVideoParams] = useState<VideoParams>({
    selectedTemplate: '', // Will be set when video is selected
    text: 'Your brand message here...',
    textPosition: 'center',
    textAlign: 'center',
    fontSize: 48,
    textColor: '#ffffff',
    textOpacity: 1,
    musicVolume: 0.5,
  });
  
  // Selected video state
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderId, setRenderId] = useState<string | null>(null);
  const [renderStatus, setRenderStatus] = useState<'idle' | 'rendering' | 'completed' | 'failed'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [actualVideoDuration, setActualVideoDuration] = useState<number>(30); // Default to 30 seconds

  // Handle video selection from VideoSelector
  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    setVideoParams(prev => ({ 
      ...prev, 
      selectedTemplate: video.filename 
    }));
    console.log('Selected video:', video);
  };

  // Create template object from selected video
  const template = selectedVideo ? {
    id: selectedVideo.id,
    name: `Video ${selectedVideo.id}`,
    url: selectedVideo.url,
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
    setVideoParams(prev => ({ ...prev, text }));
  };

  // Handle text position change
  const handlePositionChange = (textPosition: 'top' | 'center' | 'bottom') => {
    setVideoParams(prev => ({ ...prev, textPosition }));
  };

  // Handle text alignment change
  const handleAlignmentChange = (textAlign: 'left' | 'center' | 'right') => {
    setVideoParams(prev => ({ ...prev, textAlign }));
  };

  // Handle font size change
  const handleFontSizeChange = (fontSize: number) => {
    setVideoParams(prev => ({ ...prev, fontSize }));
  };

  // Handle text color change
  const handleColorChange = (textColor: string) => {
    setVideoParams(prev => ({ ...prev, textColor }));
  };

  // Handle text opacity change
  const handleOpacityChange = (textOpacity: number) => {
    setVideoParams(prev => ({ ...prev, textOpacity }));
  };

  // Handle music selection
  const handleMusicSelect = (musicUrl?: string) => {
    setVideoParams(prev => ({ ...prev, musicUrl }));
  };

  // Handle music volume change
  const handleVolumeChange = (musicVolume: number) => {
    setVideoParams(prev => ({ ...prev, musicVolume }));
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
      // Start the render
      const result = await videoRenderingClient.startRender(videoParams, template);
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI UGC Studio
          </h1>
              <p className="text-slate-600 text-sm">Create viral content in minutes</p>
            </div>
            
            {/* Server Status */}
            <div className="flex items-center gap-3">
          {serverStatus === 'online' && (
                <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Server Online
                </Badge>
          )}
          {serverStatus === 'offline' && (
                <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  Server Offline
                </Badge>
              )}
              {serverStatus === 'checking' && (
                <Badge variant="outline" className="border-yellow-200 text-yellow-700 bg-yellow-50">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                  Checking...
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Panel Layout */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
          
          {/* Left Panel - Video Preview */}
          <div className="col-span-6">
            <Card className="h-full border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-slate-800">Video Preview</CardTitle>
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
                  <div className="aspect-[9/16] bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-200">
                    {selectedVideo && template ? (
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
                          templateUrl: template.url,
                          onDurationFound: handleDurationFound,
                        }}
                        durationInFrames={Math.round((template.duration || 30) * 30)}
                        compositionWidth={1080}
                        compositionHeight={1920}
                        fps={30}
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
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-white p-6">
                          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Select a Video</h3>
                          <p className="text-sm text-white/70">Choose a video template from the Video tab to start creating</p>
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
            <Card className="h-full border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-800">Customize</CardTitle>
                <p className="text-sm text-slate-600">Make it your own</p>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <Tabs defaultValue="video" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-5 mb-4 h-10 p-1 bg-slate-100 rounded-lg">
                    <TabsTrigger value="video" className="text-xs px-3 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Video</TabsTrigger>
                    <TabsTrigger value="text" className="text-xs px-3 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Text</TabsTrigger>
                    <TabsTrigger value="position" className="text-xs px-3 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Position</TabsTrigger>
                    <TabsTrigger value="music" className="text-xs px-3 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Music</TabsTrigger>
                    <TabsTrigger value="render" className="text-xs px-3 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Render</TabsTrigger>
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
                        <div className="space-y-6 pr-2">
              <MusicSelector 
                selectedMusic={videoParams.musicUrl}
                volume={videoParams.musicVolume}
                onMusicChange={handleMusicSelect}
                onVolumeChange={handleVolumeChange}
              />
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
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">Rendering Your Video</h3>
                                <p className="text-slate-600 text-sm">This usually takes 2-5 minutes</p>
                              </div>
                              <Progress value={renderProgress} className="w-full h-2" />
                </div>
              ) : renderStatus === 'completed' ? (
                            <div className="text-center space-y-6">
                              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">Video Ready!</h3>
                                <p className="text-slate-600 text-sm mb-6">Your viral content is ready to download</p>
                  </div>
                              <div className="space-y-3">
                    <Button 
                      onClick={handleDownloadVideo}
                      disabled={!downloadUrl}
                                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
                              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">Render Failed</h3>
                                <p className="text-slate-600 text-sm mb-6">Something went wrong. Please try again.</p>
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
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h1a1 1 0 011 1v2M7 4h10M7 4v16M17 4v16M17 4V2a1 1 0 011-1h1a1 1 0 011 1v2M5 8h14M5 12h14M5 16h14" />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">Ready to Render</h3>
                                <p className="text-slate-600 text-sm mb-6">Create your high-quality MP4 video</p>
                              </div>
                              
                              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">Quality:</span>
                                  <span className="font-medium">1080x1920 HD</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">Format:</span>
                                  <span className="font-medium">MP4 H.264</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">Est. Time:</span>
                                  <span className="font-medium">2-5 minutes</span>
                                </div>
                              </div>
                              
                  <Button 
                    onClick={handleRenderVideo} 
                                disabled={serverStatus !== 'online'}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
    </div>
  );
}