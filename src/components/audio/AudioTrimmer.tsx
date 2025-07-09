import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WaveformVisualization } from './WaveformVisualization';

interface AudioTrimmerProps {
  audioUrl: string;
  duration?: number;
  onTrimChange?: (startTime: number, endTime: number) => void;
  onPlaySegment?: (startTime: number, endTime: number) => void;
  className?: string;
}

export const AudioTrimmer: React.FC<AudioTrimmerProps> = ({
  audioUrl,
  duration = 30,
  onTrimChange,
  onPlaySegment,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(duration);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Convert time to pixel position
  const timeToPixel = useCallback((time: number) => {
    return (time / duration) * containerWidth;
  }, [duration, containerWidth]);

  // Convert pixel position to time
  const pixelToTime = useCallback((pixel: number) => {
    return (pixel / containerWidth) * duration;
  }, [duration, containerWidth]);

  // Handle waveform generation
  const handleWaveformGenerated = useCallback((waveformPeaks: number[]) => {
    setPeaks(waveformPeaks);
  }, []);

  // Handle trim change
  const handleTrimChange = useCallback((newStartTime: number, newEndTime: number) => {
    const clampedStart = Math.max(0, Math.min(newStartTime, duration));
    const clampedEnd = Math.max(clampedStart + 0.1, Math.min(newEndTime, duration));
    
    setStartTime(clampedStart);
    setEndTime(clampedEnd);
    
    if (onTrimChange) {
      onTrimChange(clampedStart, clampedEnd);
    }
  }, [duration, onTrimChange]);

  // Handle mouse down on handles
  const handleMouseDown = useCallback((type: 'start' | 'end') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  }, []);

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = pixelToTime(x);

    if (isDragging === 'start') {
      handleTrimChange(time, endTime);
    } else {
      handleTrimChange(startTime, time);
    }
  }, [isDragging, pixelToTime, startTime, endTime, handleTrimChange]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  // Add/remove mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle play segment
  const handlePlaySegment = () => {
    if (onPlaySegment) {
      onPlaySegment(startTime, endTime);
      setIsPlaying(true);
      
      // Reset playing state after segment duration
      const segmentDuration = (endTime - startTime) * 1000;
      setTimeout(() => setIsPlaying(false), segmentDuration);
    }
  };

  // Format time for display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-slate-900/90 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-slate-100">Audio Trimmer</h4>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePlaySegment}
              disabled={!audioUrl}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              <div className="flex items-center space-x-2">
                {isPlaying ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
                <span>Preview</span>
              </div>
            </button>
            <div className="text-sm text-slate-400">
              {formatTime(endTime - startTime)} selected
            </div>
          </div>
        </div>

        {/* Waveform Container */}
        <div ref={containerRef} className="relative">
          <WaveformVisualization
            audioUrl={audioUrl}
            width={containerWidth}
            height={80}
            onWaveformGenerated={handleWaveformGenerated}
            className="rounded-lg overflow-hidden"
          />
          
          {/* Trim Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Left mask */}
            <div 
              className="absolute top-0 left-0 h-full bg-slate-900/60 border-r border-slate-400"
              style={{ width: timeToPixel(startTime) }}
            />
            
            {/* Right mask */}
            <div 
              className="absolute top-0 right-0 h-full bg-slate-900/60 border-l border-slate-400"
              style={{ width: containerWidth - timeToPixel(endTime) }}
            />
            
            {/* Selection area */}
            <div 
              className="absolute top-0 h-full bg-purple-500/20 border-t-2 border-b-2 border-purple-400"
              style={{ 
                left: timeToPixel(startTime),
                width: timeToPixel(endTime) - timeToPixel(startTime)
              }}
            />
          </div>
          
          {/* Draggable Handles */}
          <div className="absolute inset-0">
            {/* Start handle */}
            <div
              className="absolute top-0 w-3 h-full bg-purple-500 cursor-ew-resize hover:bg-purple-400 transition-colors pointer-events-auto"
              style={{ left: timeToPixel(startTime) - 6 }}
              onMouseDown={handleMouseDown('start')}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-full" />
            </div>
            
            {/* End handle */}
            <div
              className="absolute top-0 w-3 h-full bg-purple-500 cursor-ew-resize hover:bg-purple-400 transition-colors pointer-events-auto"
              style={{ left: timeToPixel(endTime) - 6 }}
              onMouseDown={handleMouseDown('end')}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-full" />
            </div>
          </div>
        </div>

        {/* Time Display */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-slate-400">Start Time</div>
            <div className="font-mono text-slate-200">{formatTime(startTime)}</div>
          </div>
          <div className="text-center">
            <div className="text-slate-400">Duration</div>
            <div className="font-mono text-purple-400">{formatTime(endTime - startTime)}</div>
          </div>
          <div className="text-center">
            <div className="text-slate-400">End Time</div>
            <div className="font-mono text-slate-200">{formatTime(endTime)}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTrimChange(0, duration)}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-200 transition-colors"
          >
            Full Track
          </button>
          <button
            onClick={() => handleTrimChange(0, 30)}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-200 transition-colors"
          >
            First 30s
          </button>
          <button
            onClick={() => handleTrimChange(Math.max(0, duration - 30), duration)}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-200 transition-colors"
          >
            Last 30s
          </button>
          <button
            onClick={() => {
              const middle = duration / 2;
              handleTrimChange(Math.max(0, middle - 15), Math.min(duration, middle + 15));
            }}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-200 transition-colors"
          >
            Middle 30s
          </button>
        </div>
      </div>
    </div>
  );
};