import React, { useRef, useState } from 'react';
import { AudioTrimmer } from '@/components/audio/AudioTrimmer';
import { TimeControls } from '@/components/audio/TimeControls';
import { getAudioInfo } from '@/utils/audioProcessing';

interface MusicSelectorProps {
  musicUrl?: string;
  volume: number;
  selectedMusic?: string;
  onMusicChange: (musicUrl?: string) => void;
  onVolumeChange: (volume: number) => void;
  // New props for trimming
  onTrimChange?: (startTime: number, endTime: number) => void;
  trimStart?: number;
  trimEnd?: number;
}

export const MusicSelector: React.FC<MusicSelectorProps> = ({
  musicUrl,
  volume,
  selectedMusic,
  onMusicChange,
  onVolumeChange,
  onTrimChange,
  trimStart = 0,
  trimEnd,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presetErrors, setPresetErrors] = useState<Set<string>>(new Set());
  const [audioDuration, setAudioDuration] = useState<number>(30);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Preset music options
  const presetMusic = [
    { id: 'upbeat', name: 'Upbeat Pop', url: '/music/upbeat-pop.mp3' },
    { id: 'chill', name: 'Chill Vibes', url: '/music/chill-vibes.mp3' },
    { id: 'electronic', name: 'Electronic', url: '/music/electronic.mp3' },
    { id: 'cinematic', name: 'Cinematic', url: '/music/cinematic.mp3' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous errors
    setError(null);
    setIsLoading(true);

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      setError('Please select a valid audio file (MP3, WAV, M4A, OGG)');
      setIsLoading(false);
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      setError('File size must be less than 50MB');
      setIsLoading(false);
      return;
    }

    try {
      setCurrentFile(file);
      const url = URL.createObjectURL(file);
      onMusicChange(url);
      setShowTrimmer(false);
      // Load audio duration
      loadAudioDuration(url);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to process audio file. Please try again.');
      setIsLoading(false);
    }
  };

  const handlePresetSelect = (url: string) => {
    setCurrentFile(null);
    setError(null);
    onMusicChange(url);
    setIsPlaying(false);
    // Reset trimming state
    setShowTrimmer(false);
    // Load audio duration
    loadAudioDuration(url);
  };

  const handlePresetError = (presetId: string) => {
    setPresetErrors(prev => new Set([...prev, presetId]));
  };

  // Load audio duration when music changes
  const loadAudioDuration = async (audioUrl: string) => {
    try {
      const audioInfo = await getAudioInfo(audioUrl);
      setAudioDuration(audioInfo.duration);
    } catch (err) {
      console.error('Error loading audio duration:', err);
      setAudioDuration(30); // Default fallback
    }
  };

  // Handle trimming changes
  const handleTrimChange = (startTime: number, endTime: number) => {
    if (onTrimChange) {
      onTrimChange(startTime, endTime);
    }
  };

  // Handle segment preview
  const handlePlaySegment = (startTime: number, endTime: number) => {
    if (audioRef.current && musicUrl) {
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
      setIsPlaying(true);
      
      // Stop playback at end time
      const duration = (endTime - startTime) * 1000;
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }, duration);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current && musicUrl) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRemoveMusic = () => {
    setCurrentFile(null);
    setError(null);
    onMusicChange(undefined);
    setIsPlaying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold mb-4 text-slate-100">Background Music</h3>
      
      <div className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-700/50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-sm text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Current Music Display */}
        {musicUrl && (
          <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlayback}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
                <div>
                  <div className="text-sm font-medium text-slate-100">
                    {currentFile ? currentFile.name : 'Preset Music'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {currentFile ? 'Custom Upload' : 'Built-in Track'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleRemoveMusic}
                className="text-red-400 hover:text-red-300 transition-colors hover:scale-110"
                title="Remove music"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            {/* Trim Controls */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-300">
                Duration: {Math.round(audioDuration)}s
              </div>
              <button
                onClick={() => setShowTrimmer(!showTrimmer)}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm text-white transition-colors"
              >
                {showTrimmer ? 'Hide' : 'Trim Audio'}
              </button>
            </div>

            {/* Hidden audio element for preview */}
            {musicUrl && (
              <audio
                ref={audioRef}
                src={musicUrl}
                onEnded={() => setIsPlaying(false)}
                onLoadStart={() => setIsPlaying(false)}
                onError={(e) => {
                  console.error('Audio error:', e);
                  setIsPlaying(false);
                  
                  // Check if it's a preset music file
                  const failedPreset = presetMusic.find(p => p.url === musicUrl);
                  if (failedPreset) {
                    handlePresetError(failedPreset.id);
                    setError(`Preset music "${failedPreset.name}" is not available`);
                  } else {
                    setError('Audio file could not be loaded');
                  }
                }}
                onLoadedData={() => setError(null)}
              />
            )}
          </div>
        )}

        {/* Volume Control */}
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-200">
            Music Volume: {Math.round(volume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Upload Custom Music */}
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-200">
            Upload Custom Music
          </label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className={`flex-1 border border-slate-600/50 rounded-lg px-4 py-3 text-center transition-all duration-200 ${
                isLoading 
                  ? 'bg-slate-800/50 border-slate-600/30 cursor-not-allowed' 
                  : 'bg-slate-800/80 hover:bg-slate-700/80 hover:border-slate-500/70'
              }`}
            >
              <div className="flex items-center justify-center space-x-2 text-slate-200">
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    <span>Choose Audio File</span>
                  </>
                )}
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Supported formats: MP3, WAV, M4A, OGG
          </div>
        </div>

        {/* Preset Music Options */}
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-200">
            Or Choose Preset Music
          </label>
          <div className="grid grid-cols-2 gap-2">
            {presetMusic.map((preset) => {
              const hasError = presetErrors.has(preset.id);
              return (
                <div key={preset.id} className="relative">
                  <button
                    onClick={() => handlePresetSelect(preset.url)}
                    disabled={hasError}
                    className={`w-full p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      hasError
                        ? 'border-red-600/50 bg-red-900/20 text-red-400 cursor-not-allowed'
                        : musicUrl === preset.url
                        ? 'border-purple-400 bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-400/25 hover:scale-105'
                        : 'border-slate-600/50 bg-slate-800/80 text-slate-300 hover:border-slate-500/70 hover:bg-slate-700/80 hover:scale-105'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {hasError ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                      )}
                      <span>{hasError ? 'Not Available' : preset.name}</span>
                    </div>
                  </button>
                  {hasError && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Audio Trimming Interface */}
        {musicUrl && showTrimmer && (
          <div className="space-y-4">
            <AudioTrimmer
              audioUrl={musicUrl}
              duration={audioDuration}
              onTrimChange={handleTrimChange}
              onPlaySegment={handlePlaySegment}
            />
            
            <TimeControls
              startTime={trimStart}
              endTime={trimEnd || audioDuration}
              duration={audioDuration}
              onTimeChange={handleTrimChange}
            />
          </div>
        )}

        {/* Music Tips */}
        <div className="bg-blue-950/40 border border-blue-800/50 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17A1.5,1.5 0 0,1 10.5,15.5A1.5,1.5 0 0,1 12,14A1.5,1.5 0 0,1 13.5,15.5A1.5,1.5 0 0,1 12,17M14.5,10.5C14.5,9.5 13.75,8.75 12.75,8.75H11.25C10.25,8.75 9.5,9.5 9.5,10.5V11H11V10.5H13V11.5H11V13H13V11.5C13.75,11.5 14.5,10.75 14.5,10V10.5Z"/>
            </svg>
            <div className="text-sm">
              <div className="font-medium text-blue-200 mb-1">Music Tips</div>
              <ul className="text-blue-200 space-y-1 text-xs">
                <li>• Keep music volume balanced with video audio</li>
                <li>• Choose music that matches your video's mood</li>
                <li>• Consider copyright when using custom music</li>
                {showTrimmer && <li>• Use trimming to sync music with video timing</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #8b5cf6);
          cursor: pointer;
          border: 2px solid #7c3aed;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #8b5cf6);
          cursor: pointer;
          border: 2px solid #7c3aed;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
        }
      `}</style>
    </div>
  );
};