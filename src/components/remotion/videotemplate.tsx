import React, { useState } from 'react';

interface VideoTemplate {
  id: string;
  name: string;
  url: string;
  duration: number;
}

interface VideoTemplateSelectorProps {
  templates: VideoTemplate[];
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
}

export const VideoTemplateSelector: React.FC<VideoTemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onTemplateChange,
}) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const formatDuration = (seconds: number) => {
    return `${seconds}s`;
  };

  const getTemplatePreview = (template: VideoTemplate) => {
    // You can replace these with actual thumbnail images or video previews
    const previewImages = {
      template1: '/thumbnails/urban-lifestyle.jpg',
      template2: '/thumbnails/nature-scene.jpg',
      template3: '/thumbnails/tech-demo.jpg',
    };

    return previewImages[template.id as keyof typeof previewImages] || '/thumbnails/default.jpg';
  };

  const getTemplateDescription = (templateId: string) => {
    const descriptions = {
      template1: 'Modern urban lifestyle with dynamic city scenes',
      template2: 'Peaceful nature landscapes with calming visuals',
      template3: 'Futuristic tech demonstration with sleek animations',
    };

    return descriptions[templateId as keyof typeof descriptions] || 'AI-generated video template';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Choose Video Template</h3>
      
      <div className="space-y-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative group cursor-pointer rounded-lg border-2 transition-all duration-200 ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-650'
            }`}
            onClick={() => onTemplateChange(template.id)}
            onMouseEnter={() => setHoveredTemplate(template.id)}
            onMouseLeave={() => setHoveredTemplate(null)}
          >
            <div className="flex items-center p-4">
              {/* Template Preview */}
              <div className="relative flex-shrink-0 w-20 h-12 bg-gray-900 rounded-lg overflow-hidden">
                <img
                  src={getTemplatePreview(template)}
                  alt={template.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to gradient background if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600"></div>
                
                {/* Duration Badge */}
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                  {formatDuration(template.duration)}
                </div>

                {/* Play icon overlay on hover */}
                {hoveredTemplate === template.id && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="flex-1 ml-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                    {template.name}
                  </h4>
                  {selectedTemplate === template.id && (
                    <div className="flex items-center text-blue-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {getTemplateDescription(template.id)}
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
                  </svg>
                  Duration: {formatDuration(template.duration)}
                  <span className="mx-2">•</span>
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18,16V10.5L12,7L6,10.5V16L12,19.5L18,16M12,9.5L15.5,11.5L12,13.5L8.5,11.5L12,9.5Z"/>
                  </svg>
                  1080p HD
                </div>
              </div>
            </div>

            {/* Selection indicator */}
            {selectedTemplate === template.id && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg"></div>
            )}
          </div>
        ))}
      </div>

      {/* Template Stats */}
      <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Available Templates:</span>
          <span className="text-white font-medium">{templates.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-400">Selected:</span>
          <span className="text-blue-400 font-medium">
            {templates.find(t => t.id === selectedTemplate)?.name || 'None'}
          </span>
        </div>
      </div>

      {/* Upload Custom Template (Future Feature) */}
      <div className="mt-4 p-3 bg-amber-900/20 border border-amber-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17A1.5,1.5 0 0,1 10.5,15.5A1.5,1.5 0 0,1 12,14A1.5,1.5 0 0,1 13.5,15.5A1.5,1.5 0 0,1 12,17M14.5,10.5C14.5,9.5 13.75,8.75 12.75,8.75H11.25C10.25,8.75 9.5,9.5 9.5,10.5V11H11V10.5H13V11.5H11V13H13V11.5C13.75,11.5 14.5,10.75 14.5,10V10.5Z"/>
          </svg>
          <div className="text-sm">
            <div className="text-amber-400 font-medium">Coming Soon</div>
            <div className="text-amber-200 text-xs">Upload your own video templates</div>
          </div>
        </div>
      </div>
    </div>
  );
};