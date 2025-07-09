import React, { useRef, useEffect, useState, useCallback } from 'react';

interface WaveformVisualizationProps {
  audioUrl: string;
  width?: number;
  height?: number;
  className?: string;
  onWaveformGenerated?: (peaks: number[]) => void;
  onError?: (error: string) => void;
}

export const WaveformVisualization: React.FC<WaveformVisualizationProps> = ({
  audioUrl,
  width = 800,
  height = 100,
  className = '',
  onWaveformGenerated,
  onError,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate waveform data from audio file
  const generateWaveform = useCallback(async () => {
    if (!audioUrl || !canvasRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Fetch audio file
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Get audio data from first channel
      const rawData = audioBuffer.getChannelData(0);
      const samples = width; // Number of samples to generate
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData: number[] = [];
      
      // Process audio data to create peaks
      for (let i = 0; i < samples; i++) {
        const blockStart = blockSize * i;
        let sum = 0;
        
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        
        filteredData.push(sum / blockSize);
      }
      
      // Normalize the data
      const maxPeak = Math.max(...filteredData);
      const normalizedData = filteredData.map(peak => (peak / maxPeak) * height);
      
      setPeaks(normalizedData);
      if (onWaveformGenerated) {
        onWaveformGenerated(normalizedData);
      }
      
      // Clean up
      audioContext.close();
    } catch (err) {
      console.error('Error generating waveform:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate waveform';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [audioUrl, width, height, onWaveformGenerated, onError]);

  // Draw waveform on canvas
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || peaks.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up drawing style
    ctx.fillStyle = '#8b5cf6'; // Purple color
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1;

    // Draw waveform bars
    const barWidth = width / peaks.length;
    
    peaks.forEach((peak, index) => {
      const x = index * barWidth;
      const barHeight = peak || 1; // Minimum height of 1
      const y = (height - barHeight) / 2;
      
      // Draw bar
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw center line
    ctx.strokeStyle = '#475569'; // Slate color
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }, [peaks, width, height]);

  // Generate waveform when audio URL changes
  useEffect(() => {
    generateWaveform();
  }, [generateWaveform]);

  // Draw waveform when peaks change
  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-900/20 border border-red-700/50 rounded-lg ${className}`} 
           style={{ width, height }}>
        <div className="text-center">
          <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <p className="text-red-300 text-sm">Waveform Error</p>
          <p className="text-red-400 text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-slate-800/50 border border-slate-600/50 rounded-lg ${className}`} 
           style={{ width, height }}>
        <div className="text-center">
          <svg className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-purple-300 text-sm">Generating Waveform...</p>
          <p className="text-slate-400 text-xs mt-1">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="bg-slate-800/80 border border-slate-600/50 rounded-lg"
        style={{ width, height }}
      />
      
      {/* Hidden audio element for duration calculation */}
      <audio
        ref={audioRef}
        src={audioUrl}
        style={{ display: 'none' }}
        onError={() => setError('Failed to load audio file')}
      />
    </div>
  );
};