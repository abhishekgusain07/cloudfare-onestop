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

// Empty initial state for video templates
const initialTemplates: Template[] = [];

export default function CreatePage() {
  const router = useRouter();
  const [videoParams, setVideoParams] = useState<VideoParams>({
    selectedTemplate: 'template1',
    text: 'Your brand message here...',
    textPosition: 'center',
    textAlign: 'center',
    fontSize: 48,
    textColor: '#ffffff',
    textOpacity: 1,
    musicVolume: 0.5,
  });
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
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
          setSelectedTemplate(data[0]);
          setVideoParams(prev => ({ ...prev, selectedTemplate: data[0].id }));
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
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Video Preview */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Video Preview</h2>
              {selectedTemplate && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <Player
                    component={VideoComposition}
                    inputProps={{
                      selectedTemplate: selectedTemplate.id,
                      text: videoParams.text,
                      textPosition: videoParams.textPosition,
                      textAlign: videoParams.textAlign,
                      fontSize: videoParams.fontSize,
                      textColor: videoParams.textColor,
                      textOpacity: videoParams.textOpacity,
                      musicUrl: videoParams.musicUrl,
                      musicVolume: videoParams.musicVolume,
                    }}
                    durationInFrames={selectedTemplate.duration * 30} // Assuming 30 fps
                    compositionWidth={1080}
                    compositionHeight={1920}
                    fps={30}
                    className="w-full h-full"
                  />
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
              {isRendering ? (
                <div className="space-y-4">
                  <Progress value={renderProgress} className="w-full" />
                  <div className="text-center text-gray-600">
                    {renderStatus === 'rendering' 
                      ? `Rendering... ${renderProgress}%` 
                      : renderStatus === 'completed' 
                        ? 'Render Complete!' 
                        : 'Render Failed'}
                  </div>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Button 
                    onClick={handleRenderVideo} 
                    disabled={serverStatus !== 'online' || !selectedTemplate}
                    className="flex-1"
                  >
                    Render Video
                  </Button>
                  {downloadUrl && (
                    <Button 
                      variant="secondary" 
                      onClick={handleDownloadVideo}
                      className="flex-1"
                    >
                      Download Video
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}