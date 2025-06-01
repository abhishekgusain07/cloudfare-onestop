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
        
        // Poll for render status
        const statusInterval = setInterval(async () => {
          const statusResponse = await fetch(`/api/render/${data.renderId}/status`);
          const statusData = await statusResponse.json();
          
          if (statusData.status === 'completed') {
            clearInterval(statusInterval);
            setIsRendering(false);
            setRenderProgress(100);
            toast.success('Video rendering complete!');
            // Navigate to download page or show download button
          } else if (statusData.status === 'failed') {
            clearInterval(statusInterval);
            setIsRendering(false);
            toast.error('Video rendering failed. Please try again.');
          } else if (statusData.status === 'rendering') {
            setRenderProgress(statusData.progress || 0);
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
    
    window.location.href = `/api/download/${renderId}`;
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Create Your UGC Video</h1>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading video templates...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Preview */}
          <div className="lg:col-span-2 bg-gray-900 rounded-lg overflow-hidden">
            {selectedTemplate ? (
              <div className="aspect-video">
                <Player
                  component={VideoComposition}
                  durationInFrames={(selectedTemplate?.duration || 15) * 30} // 30fps
                  fps={30}
                  compositionWidth={1920}
                  compositionHeight={1080}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  controls
                  inputProps={{
                    ...videoParams,
                    templateUrl: selectedTemplate?.url,
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-800 text-gray-400">
                <p>No template selected. Please select a template from the Template tab.</p>
              </div>
            )}
          </div>
          
          {/* Editor Controls */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <Tabs defaultValue="text">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="position">Position</TabsTrigger>
                <TabsTrigger value="music">Music</TabsTrigger>
                <TabsTrigger value="template">Template</TabsTrigger>
              </TabsList>
            
              <TabsContent value="text">
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
              
              <TabsContent value="position">
                <PositionSelector
                  position={videoParams.textPosition}
                  align={videoParams.textAlign}
                  onPositionChange={handlePositionChange}
                  onAlignChange={handleAlignmentChange}
                />
              </TabsContent>
              
              <TabsContent value="music">
                <MusicSelector
                  selectedMusic={videoParams.musicUrl}
                  volume={videoParams.musicVolume}
                  onMusicChange={handleMusicSelect}
                  onVolumeChange={handleVolumeChange}
                />
              </TabsContent>
              
              <TabsContent value="template">
                <div className="grid grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                        videoParams.selectedTemplate === template.id
                          ? 'border-blue-500'
                          : 'border-transparent'
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <div className="aspect-video bg-gray-800">
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
          
            <div className="mt-8">
              {isRendering ? (
                <div className="space-y-4">
                  <Progress value={renderProgress} />
                  <p className="text-center">Rendering: {renderProgress}%</p>
                </div>
              ) : renderId ? (
                <Button
                  className="w-full"
                  onClick={handleDownloadVideo}
                >
                  Download Video
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleRenderVideo}
                >
                  Render Video
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
