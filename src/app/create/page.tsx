'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '@remotion/player';
import { VideoComposition } from '@/components/remotion/videoComposition';
import { TextEditor } from '@/components/remotion/texteditor';
import { PositionSelector } from '@/components/remotion/positionselector';
import { MusicSelector } from '@/components/remotion/musicselector';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { videoRenderingClient } from '@/utils/videoRenderingClient';

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

// Define the template interface
interface Template {
  id: string;
  name: string;
  url: string;
  duration: number;
  thumbnail: string;
  size?: number;
  created?: Date;
}

export default function CreatePage() {
  const router = useRouter();
  const [videoParams, setVideoParams] = useState<VideoParams>({
    selectedTemplate: '',
    text: 'Your brand message here...',
    textPosition: 'center',
    textAlign: 'center',
    fontSize: 48,
    textColor: '#ffffff',
    textOpacity: 1,
    musicVolume: 0.5,
  });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderId, setRenderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [renderStatus, setRenderStatus] = useState<'idle' | 'rendering' | 'completed' | 'failed'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

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

  // Fetch templates from the API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/videos?directory=/ugc/videos');
        if (!response.ok) {
          throw new Error('Failed to fetch video templates');
        }
        const data = await response.json();
        setTemplates(data);
        
        // Set default template if available
        if (data.length > 0) {
          const firstTemplate = data[0];
          setSelectedTemplate(firstTemplate);
          setVideoParams(prev => ({ 
            ...prev, 
            selectedTemplate: firstTemplate.id // This should be just the filename like "1.mp4"
          }));
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast.error('Failed to load video templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Update selected template when template ID changes
  useEffect(() => {
    const template = templates.find((t: Template) => t.id === videoParams.selectedTemplate);
    if (template) {
      setSelectedTemplate(template);
    }
  }, [videoParams.selectedTemplate, templates]);

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

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setVideoParams(prev => ({ ...prev, selectedTemplate: templateId }));
  };

  // Handle video rendering with the new client
  const handleRenderVideo = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a video template');
      return;
    }

    if (serverStatus !== 'online') {
      toast.error('Video rendering server is not available. Please check if it\'s running.');
      return;
    }
    
    setIsRendering(true);
    setRenderProgress(0);
    setRenderStatus('rendering');
    setDownloadUrl(null);
    
    try {
      // Start the render
      const result = await videoRenderingClient.startRender(videoParams, selectedTemplate);
      
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Create Your Marketing Video with AI
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Customize your video with templates, text, music, and more. Get started in just a few clicks!
          </p>
        </div>

        {/* Server Status Indicator */}
        <div className="mb-6 flex justify-center">
          {serverStatus === 'checking' && (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking server status...
            </div>
          )}
          {serverStatus === 'online' && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              ✅ Video Rendering Server Online
            </div>
          )}
          {serverStatus === 'offline' && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg">
              ❌ Video Rendering Server Offline
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: Template & Preview */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Template</h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <svg className="animate-spin h-10 w-10 text-blue-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`
                        relative overflow-hidden rounded-lg border-2 transition-all duration-300
                        ${videoParams.selectedTemplate === template.id 
                          ? 'border-blue-500 ring-4 ring-blue-200' 
                          : 'border-gray-200 hover:border-blue-300'}
                      `}
                    >
                      <img 
                        src={template.thumbnail} 
                        alt={template.name} 
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all"></div>
                      {videoParams.selectedTemplate === template.id && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                          ✓
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                        {template.name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Video Preview */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Video Preview</h2>
              {selectedTemplate && videoParams.selectedTemplate ? (
                <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden">
                  <Player
                    component={VideoComposition}
                    inputProps={{
                      selectedTemplate: videoParams.selectedTemplate, // Pass just the filename
                      text: videoParams.text,
                      textPosition: videoParams.textPosition,
                      textAlign: videoParams.textAlign,
                      fontSize: videoParams.fontSize,
                      textColor: videoParams.textColor,
                      textOpacity: videoParams.textOpacity,
                      musicUrl: videoParams.musicUrl,
                      musicVolume: videoParams.musicVolume,
                      templateUrl: undefined, // Let VideoComposition handle URL construction
                    }}
                    durationInFrames={selectedTemplate.duration * 30} // Assuming 30 fps
                    compositionWidth={1080}
                    compositionHeight={1920}
                    fps={30}
                    className="w-full h-full"
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-[9/16] bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-gray-500 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M12 5v.01M12 19v.01M12 12h.01M7 12h.01M17 12h.01" />
                    </svg>
                    <p>Select a template to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Editing Tools */}
          <div className="space-y-6">
            {/* Text Editing */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Customize Text</h2>
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

            {/* Position Selector */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Text Position & Alignment</h2>
              <PositionSelector
                position={videoParams.textPosition}
                align={videoParams.textAlign}
                onPositionChange={handlePositionChange }
                onAlignChange={handleAlignmentChange}
              />
            </div>

            {/* Music Selection */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Background Music</h2>
              <MusicSelector 
                selectedMusic={videoParams.musicUrl}
                volume={videoParams.musicVolume}
                onMusicChange={handleMusicSelect}
                onVolumeChange={handleVolumeChange}
              />
            </div>

            {/* Render Controls */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Render Video</h2>
              {renderStatus === 'rendering' ? (
                <div className="space-y-4">
                  <Progress value={renderProgress} className="w-full" />
                  <div className="text-center text-gray-600">
                    Rendering... {renderProgress}%
                  </div>
                  <div className="text-center text-sm text-gray-500">
                    This may take a few minutes depending on video length
                  </div>
                </div>
              ) : renderStatus === 'completed' ? (
                <div className="space-y-4">
                  <div className="text-center text-green-600 font-semibold">
                    ✅ Render Complete!
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={handleDownloadVideo}
                      disabled={!downloadUrl}
                      className="flex-1"
                    >
                      Download Video
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleResetRender}
                      className="flex-1"
                    >
                      Render New Video
                    </Button>
                  </div>
                </div>
              ) : renderStatus === 'failed' ? (
                <div className="space-y-4">
                  <div className="text-center text-red-600 font-semibold">
                    ❌ Render Failed
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={handleRenderVideo}
                      disabled={serverStatus !== 'online' || !selectedTemplate}
                      className="flex-1"
                    >
                      Try Again
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleResetRender}
                      className="flex-1"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button 
                    onClick={handleRenderVideo} 
                    disabled={serverStatus !== 'online' || !selectedTemplate || !videoParams.selectedTemplate}
                    className="w-full"
                    size="lg"
                  >
                    {serverStatus !== 'online' 
                      ? 'Server Offline' 
                      : !selectedTemplate 
                        ? 'Select a Template' 
                        : 'Render Video'}
                  </Button>
                  <div className="text-center text-sm text-gray-500">
                    High-quality MP4 output • Estimated 2-5 minutes
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}