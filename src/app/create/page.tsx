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

  // Handle video rendering
  const handleRenderVideo = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a video template');
      return;
    }
    
    setIsRendering(true);
    setRenderProgress(0);
    
    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoParams,
          template: selectedTemplate,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRenderId(data.renderId);
        toast.success('Video rendering started!');
        
        // Poll for render status
        const statusInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/render/${data.renderId}/status`);
            if (!statusResponse.ok) {
              console.error('Error fetching render status:', await statusResponse.text());
              return;
            }
            
            const statusData = await statusResponse.json();
            console.log('Render status:', statusData);
            
            if (statusData.status === 'completed') {
              clearInterval(statusInterval);
              setIsRendering(false);
              setRenderProgress(100);
              toast.success('Video rendering complete! Click Download to get your video.');
            } else if (statusData.status === 'failed') {
              clearInterval(statusInterval);
              setIsRendering(false);
              toast.error(statusData.error || 'Video rendering failed. Please try again.');
            } else if (statusData.status === 'rendering') {
              setRenderProgress(statusData.progress || 0);
            }
          } catch (error) {
            console.error('Error checking render status:', error);
          }
        }, 2000);
      } else {
        setIsRendering(false);
        toast.error(data.error || 'Failed to start rendering');
      }
    } catch (error) {
      console.error('Error rendering video:', error);
      setIsRendering(false);
      toast.error('An error occurred while rendering the video');
    }
  };

  // Handle video download
  const handleDownloadVideo = async () => {
    if (!renderId) return;
    
    try {
      // Check if the render is complete before downloading
      const statusResponse = await fetch(`/api/render/${renderId}/status`);
      const statusData = await statusResponse.json();
      
      if (statusData.status === 'completed') {
        // Direct download via window location
        window.location.href = `/api/download/${renderId}`;
      } else if (statusData.status === 'rendering') {
        toast.info(`Video is still rendering (${statusData.progress || 0}% complete). Please wait.`);
      } else {
        toast.error('Video is not available for download yet.');
      }
    } catch (error) {
      console.error('Error checking render status before download:', error);
      toast.error('Error preparing download. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main content area */}
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Create Your UGC Video</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading video templates...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Video Preview - Takes more space on larger screens */}
            <div className="lg:w-2/3 flex flex-col">
              <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl">
                {selectedTemplate ? (
                  <div className="relative">
                    {/* Video container with fixed 9:16 aspect ratio for mobile-style videos */}
                    <div className="mx-auto" style={{ maxWidth: '500px' }}>
                      <div className="relative" style={{ paddingBottom: '177.78%' }}> {/* 9:16 aspect ratio */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                          <Player
                            component={VideoComposition}
                            durationInFrames={(selectedTemplate?.duration || 15) * 30} // 30fps
                            fps={30}
                            compositionWidth={1080}
                            compositionHeight={1920} // 9:16 aspect ratio for mobile videos
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '12px',
                            }}
                            controls
                            inputProps={{
                              ...videoParams,
                              templateUrl: selectedTemplate?.url,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 bg-gray-800 text-gray-400 rounded-xl">
                    <p className="text-center px-8">No template selected. Please select a template from the Template tab.</p>
                  </div>
                )}
              </div>
              
              {/* Render/Download buttons */}
              <div className="mt-6 bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={handleRenderVideo} 
                    disabled={isRendering || !selectedTemplate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRendering ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        <span>Rendering... {renderProgress}%</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        <span>Render Video</span>
                      </>
                    )}
                  </Button>
                  
                  {renderId && (
                    <Button 
                      onClick={handleDownloadVideo}
                      disabled={isRendering || renderProgress < 100}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>{isRendering ? `Wait (${renderProgress}%)` : 'Download'}</span>
                    </Button>
                  )}
                </div>
                
                {/* Render progress indicator */}
                {isRendering && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                        style={{ width: `${renderProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Rendering your video... {renderProgress}% complete
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Editor Controls - Takes less space */}
            <div className="lg:w-1/3 bg-white p-6 rounded-xl shadow-sm">
              <Tabs defaultValue="text" className="space-y-6">
                <TabsList className="grid grid-cols-4 mb-6 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger value="text" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">Text</TabsTrigger>
                  <TabsTrigger value="position" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">Position</TabsTrigger>
                  <TabsTrigger value="music" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">Music</TabsTrigger>
                  <TabsTrigger value="template" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">Template</TabsTrigger>
                </TabsList>
              
                <TabsContent value="text" className="space-y-4">
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
                </TabsContent>
                
                <TabsContent value="position" className="space-y-4">
                  <PositionSelector
                    position={videoParams.textPosition}
                    align={videoParams.textAlign}
                    onPositionChange={handlePositionChange}
                    onAlignChange={handleAlignmentChange}
                  />
                </TabsContent>
                
                <TabsContent value="music" className="space-y-4">
                  <MusicSelector
                    selectedMusic={videoParams.musicUrl}
                    volume={videoParams.musicVolume}
                    onMusicChange={handleMusicSelect}
                    onVolumeChange={handleVolumeChange}
                  />
                </TabsContent>
                
                <TabsContent value="template" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:shadow-md ${
                          videoParams.selectedTemplate === template.id
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-transparent'
                        }`}
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <div className="aspect-[9/16] bg-gray-800"> {/* 9:16 aspect ratio for template thumbnails */}
                          <img
                            src={template.thumbnail}
                            alt={template.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2 text-sm font-medium">{template.name}</div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
