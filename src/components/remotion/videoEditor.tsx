import React, { useState, useRef } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { VideoComposition } from '../components/VideoComposition';
import { TextEditor } from '../components/TextEditor';
import { PositionSelector } from '../components/PositionSelector';
import { MusicSelector } from '../components/MusicSelector';
import { VideoTemplateSelector } from '../components/VideoTemplateSelector';

// Types for our video parameters
export interface VideoParams {
  selectedTemplate: string;
  text: string;
  textPosition: 'top' | 'center' | 'bottom';
  textAlign: 'left' | 'center' | 'right';
  fontSize: number;
  textColor: string;
  musicUrl?: string;
  musicVolume: number;
}

const VideoEditorPage: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);
  
  // Video parameters state
  const [videoParams, setVideoParams] = useState<VideoParams>({
    selectedTemplate: 'template1', // Default template
    text: 'Your text here...',
    textPosition: 'center',
    textAlign: 'center',
    fontSize: 48,
    textColor: '#ffffff',
    musicVolume: 0.5,
  });

  // Available AI UGC video templates
  const videoTemplates = [
    { id: 'template1', name: 'Urban Lifestyle', url: '/videos/urban-lifestyle.mp4', duration: 15 },
    { id: 'template2', name: 'Nature Scene', url: '/videos/nature-scene.mp4', duration: 12 },
    { id: 'template3', name: 'Tech Demo', url: '/videos/tech-demo.mp4', duration: 18 },
  ];

  const updateVideoParams = (updates: Partial<VideoParams>) => {
    setVideoParams(prev => ({ ...prev, ...updates }));
  };

  const handleRender = async () => {
    try {
      // This will trigger the API route to render video with AWS Lambda
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoParams,
          template: videoTemplates.find(t => t.id === videoParams.selectedTemplate)
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('Render started:', result.renderId);
        // Handle render progress/status updates here
      } else {
        console.error('Render failed:', result.error);
      }
    } catch (error) {
      console.error('Failed to start render:', error);
    }
  };

  const selectedTemplate = videoTemplates.find(t => t.id === videoParams.selectedTemplate);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Create Your Video</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Preview */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <Player
                  ref={playerRef}
                  component={VideoComposition}
                  inputProps={videoParams}
                  durationInFrames={selectedTemplate ? selectedTemplate.duration * 30 : 450} // 30fps
                  compositionWidth={1920}
                  compositionHeight={1080}
                  fps={30}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  controls
                />
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Template: {selectedTemplate?.name || 'None selected'}
                </div>
                <button
                  onClick={handleRender}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Render Video
                </button>
              </div>
            </div>
          </div>

          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Template Selection */}
            <VideoTemplateSelector
              templates={videoTemplates}
              selectedTemplate={videoParams.selectedTemplate}
              onTemplateChange={(templateId) => updateVideoParams({ selectedTemplate: templateId })}
            />

            {/* Text Editor */}
            <TextEditor
              text={videoParams.text}
              fontSize={videoParams.fontSize}
              textColor={videoParams.textColor}
              onTextChange={(text) => updateVideoParams({ text })}
              onFontSizeChange={(fontSize) => updateVideoParams({ fontSize })}
              onColorChange={(textColor) => updateVideoParams({ textColor })}
            />

            {/* Position Selector */}
            <PositionSelector
              position={videoParams.textPosition}
              align={videoParams.textAlign}
              onPositionChange={(textPosition) => updateVideoParams({ textPosition })}
              onAlignChange={(textAlign) => updateVideoParams({ textAlign })}
            />

            {/* Music Selector */}
            <MusicSelector
              musicUrl={videoParams.musicUrl}
              volume={videoParams.musicVolume}
              onMusicChange={(musicUrl) => updateVideoParams({ musicUrl })}
              onVolumeChange={(musicVolume) => updateVideoParams({ musicVolume })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditorPage;