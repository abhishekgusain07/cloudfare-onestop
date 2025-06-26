import React, { useState } from 'react';
import { Settings, Monitor, Smartphone, Zap } from 'lucide-react';

export type VideoQuality = 'high' | 'medium' | 'low';
export type PerformanceMode = 'quality' | 'balanced' | 'performance';

interface PerformanceSettingsProps {
  onQualityChange: (quality: VideoQuality) => void;
  onPerformanceModeChange: (mode: PerformanceMode) => void;
  currentQuality: VideoQuality;
  currentMode: PerformanceMode;
}

export const PerformanceSettings: React.FC<PerformanceSettingsProps> = ({
  onQualityChange,
  onPerformanceModeChange,
  currentQuality,
  currentMode
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const qualityOptions = [
    {
      value: 'high' as VideoQuality,
      label: 'High Quality',
      description: '1080p - Best quality, requires good hardware',
      icon: Monitor
    },
    {
      value: 'medium' as VideoQuality,
      label: 'Medium Quality',
      description: '720p - Balanced quality and performance',
      icon: Smartphone
    },
    {
      value: 'low' as VideoQuality,
      label: 'Low Quality',
      description: '480p - Fastest playback, lower quality',
      icon: Zap
    }
  ];

  const performanceModes = [
    {
      value: 'quality' as PerformanceMode,
      label: 'Quality First',
      description: 'Best visual quality, may be slower'
    },
    {
      value: 'balanced' as PerformanceMode,
      label: 'Balanced',
      description: 'Good balance of quality and speed'
    },
    {
      value: 'performance' as PerformanceMode,
      label: 'Performance First',
      description: 'Fastest playback, reduced quality'
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        title="Performance Settings"
      >
        <Settings className="w-4 h-4" />
        <span className="text-sm">Performance</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Video Performance Settings</h3>
            
            {/* Quality Settings */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Video Quality</h4>
              <div className="space-y-2">
                {qualityOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        currentQuality === option.value
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="quality"
                        value={option.value}
                        checked={currentQuality === option.value}
                        onChange={() => onQualityChange(option.value)}
                        className="mt-1"
                      />
                      <IconComponent className="w-4 h-4 mt-0.5 text-gray-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Performance Mode */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Mode</h4>
              <div className="space-y-2">
                {performanceModes.map((mode) => (
                  <label
                    key={mode.value}
                    className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      currentMode === mode.value
                        ? 'bg-green-50 border border-green-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="performance"
                      value={mode.value}
                      checked={currentMode === mode.value}
                      onChange={() => onPerformanceModeChange(mode.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{mode.label}</div>
                      <div className="text-xs text-gray-500">{mode.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h5 className="text-xs font-medium text-yellow-800 mb-1">💡 Performance Tips</h5>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Use "Performance First" mode on slower devices</li>
                <li>• Lower quality reduces bandwidth usage</li>
                <li>• Close other browser tabs for better performance</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 