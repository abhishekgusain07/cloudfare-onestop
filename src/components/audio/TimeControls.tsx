import React, { useState, useEffect } from 'react';

interface TimeControlsProps {
  startTime: number;
  endTime: number;
  duration: number;
  onTimeChange?: (startTime: number, endTime: number) => void;
  className?: string;
}

export const TimeControls: React.FC<TimeControlsProps> = ({
  startTime,
  endTime,
  duration,
  onTimeChange,
  className = '',
}) => {
  const [localStartTime, setLocalStartTime] = useState(startTime);
  const [localEndTime, setLocalEndTime] = useState(endTime);
  const [startError, setStartError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);

  // Update local state when props change
  useEffect(() => {
    setLocalStartTime(startTime);
    setLocalEndTime(endTime);
  }, [startTime, endTime]);

  // Format time for input (MM:SS.MS)
  const formatTimeForInput = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  // Parse time from input (MM:SS.MS)
  const parseTimeFromInput = (timeString: string): number | null => {
    const regex = /^(\d{1,2}):(\d{2})(?:\.(\d{1,2}))?$/;
    const match = timeString.match(regex);
    
    if (!match) return null;
    
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    const milliseconds = match[3] ? parseInt(match[3].padEnd(2, '0'), 10) : 0;
    
    if (minutes > 59 || seconds > 59 || milliseconds > 99) return null;
    
    return minutes * 60 + seconds + milliseconds / 100;
  };

  // Validate time input
  const validateTime = (time: number, type: 'start' | 'end'): string | null => {
    if (time < 0) return 'Time cannot be negative';
    if (time > duration) return `Time cannot exceed ${formatTimeForInput(duration)}`;
    
    if (type === 'start' && time >= localEndTime) {
      return 'Start time must be before end time';
    }
    if (type === 'end' && time <= localStartTime) {
      return 'End time must be after start time';
    }
    
    return null;
  };

  // Handle start time change
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedTime = parseTimeFromInput(value);
    
    if (parsedTime === null) {
      setStartError('Invalid time format (MM:SS.MS)');
      return;
    }
    
    const error = validateTime(parsedTime, 'start');
    setStartError(error);
    
    if (!error) {
      setLocalStartTime(parsedTime);
      if (onTimeChange) {
        onTimeChange(parsedTime, localEndTime);
      }
    }
  };

  // Handle end time change
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedTime = parseTimeFromInput(value);
    
    if (parsedTime === null) {
      setEndError('Invalid time format (MM:SS.MS)');
      return;
    }
    
    const error = validateTime(parsedTime, 'end');
    setEndError(error);
    
    if (!error) {
      setLocalEndTime(parsedTime);
      if (onTimeChange) {
        onTimeChange(localStartTime, parsedTime);
      }
    }
  };

  // Quick time adjustment functions
  const adjustStartTime = (delta: number) => {
    const newTime = Math.max(0, Math.min(localStartTime + delta, localEndTime - 0.1));
    setLocalStartTime(newTime);
    setStartError(null);
    if (onTimeChange) {
      onTimeChange(newTime, localEndTime);
    }
  };

  const adjustEndTime = (delta: number) => {
    const newTime = Math.max(localStartTime + 0.1, Math.min(localEndTime + delta, duration));
    setLocalEndTime(newTime);
    setEndError(null);
    if (onTimeChange) {
      onTimeChange(localStartTime, newTime);
    }
  };

  return (
    <div className={`bg-muted/80 rounded-lg p-4 border border-border/50 ${className}`}>
      <h5 className="text-sm font-medium text-foreground mb-3">Precise Time Controls</h5>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Start Time */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-muted-foreground">Start Time</label>
          <div className="relative">
            <input
              type="text"
              value={formatTimeForInput(localStartTime)}
              onChange={handleStartTimeChange}
              placeholder="MM:SS.MS"
              className={`w-full px-3 py-2 bg-muted/80 border rounded-lg text-sm font-mono text-foreground focus:outline-none focus:ring-2 transition-colors ${
                startError 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-border focus:ring-purple-500'
              }`}
            />
            {startError && (
              <div className="absolute -bottom-5 left-0 text-xs text-red-400">
                {startError}
              </div>
            )}
          </div>
          
          {/* Quick adjustment buttons */}
          <div className="flex space-x-1">
            <button
              onClick={() => adjustStartTime(-1)}
              className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs text-foreground transition-colors"
              title="Subtract 1 second"
            >
              -1s
            </button>
            <button
              onClick={() => adjustStartTime(-0.1)}
              className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs text-foreground transition-colors"
              title="Subtract 0.1 seconds"
            >
              -0.1s
            </button>
            <button
              onClick={() => adjustStartTime(0.1)}
              className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs text-foreground transition-colors"
              title="Add 0.1 seconds"
            >
              +0.1s
            </button>
            <button
              onClick={() => adjustStartTime(1)}
              className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs text-foreground transition-colors"
              title="Add 1 second"
            >
              +1s
            </button>
          </div>
        </div>

        {/* End Time */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-muted-foreground">End Time</label>
          <div className="relative">
            <input
              type="text"
              value={formatTimeForInput(localEndTime)}
              onChange={handleEndTimeChange}
              placeholder="MM:SS.MS"
              className={`w-full px-3 py-2 bg-muted/80 border rounded-lg text-sm font-mono text-foreground focus:outline-none focus:ring-2 transition-colors ${
                endError 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-border focus:ring-purple-500'
              }`}
            />
            {endError && (
              <div className="absolute -bottom-5 left-0 text-xs text-red-400">
                {endError}
              </div>
            )}
          </div>
          
          {/* Quick adjustment buttons */}
          <div className="flex space-x-1">
            <button
              onClick={() => adjustEndTime(-1)}
              className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs text-foreground transition-colors"
              title="Subtract 1 second"
            >
              -1s
            </button>
            <button
              onClick={() => adjustEndTime(-0.1)}
              className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs text-foreground transition-colors"
              title="Subtract 0.1 seconds"
            >
              -0.1s
            </button>
            <button
              onClick={() => adjustEndTime(0.1)}
              className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs text-foreground transition-colors"
              title="Add 0.1 seconds"
            >
              +0.1s
            </button>
            <button
              onClick={() => adjustEndTime(1)}
              className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs text-foreground transition-colors"
              title="Add 1 second"
            >
              +1s
            </button>
          </div>
        </div>
      </div>

      {/* Duration Display */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Selection Duration:</span>
          <span className="font-mono text-purple-400">
            {formatTimeForInput(localEndTime - localStartTime)}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
          <span>Total Duration:</span>
          <span className="font-mono">{formatTimeForInput(duration)}</span>
        </div>
      </div>

      {/* Format Help */}
      <div className="mt-3 text-xs text-muted-foreground">
        <p>Time format: MM:SS.MS (e.g., 01:23.45 = 1 minute, 23.45 seconds)</p>
      </div>
    </div>
  );
};