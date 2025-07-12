import React, { useRef, useState } from 'react';
import { AudioTrimmer } from '@/components/audio/AudioTrimmer';
import { TimeControls } from '@/components/audio/TimeControls';
import { MusicLibraryDialog } from '@/components/ui/MusicLibraryDialog';
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
  // Expose upload validation function
  onUploadValidatorChange?: (validator: () => Promise<string | undefined>) => void;
}

interface MusicTrack {
  id: string;
  userId: string;
  title: string;
  filename: string;
  url: string;
  duration: number;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  lastUsed?: string;
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
  onUploadValidatorChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMusicTrack, setCurrentMusicTrack] = useState<MusicTrack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [presetErrors, setPresetErrors] = useState<Set<string>>(new Set());
  const [audioDuration, setAudioDuration] = useState<number>(30);
  const [showTrimmer, setShowTrimmer] = useState(true);
  const [showMusicLibrary, setShowMusicLibrary] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  console.log('musicUrl bhenchod bhenchod ', musicUrl);
  // Preset music options
  const presetMusic = [
    { id: 'upbeat', name: 'Upbeat Pop', url: '/music/upbeat-pop.mp3' },
    { id: 'chill', name: 'Chill Vibes', url: '/music/chill-vibes.mp3' },
    { id: 'electronic', name: 'Electronic', url: '/music/electronic.mp3' },
    { id: 'cinematic', name: 'Cinematic', url: '/music/cinematic.mp3' },
  ];



  // Function to ensure music is uploaded before rendering
  const ensureMusicUploaded = React.useCallback(async (): Promise<string | undefined> => {
    if (!musicUrl) return undefined;
    
    // All music should already be uploaded and ready
    return musicUrl;
  }, [musicUrl]);

  // Expose the upload validator function to parent
  React.useEffect(() => {
    if (onUploadValidatorChange) {
      onUploadValidatorChange(ensureMusicUploaded);
    }
  }, [onUploadValidatorChange, ensureMusicUploaded]);

  const handlePresetSelect = (url: string) => {
    setError(null);
    onMusicChange(url);
    setIsPlaying(false);
    // Ensure trimmer is visible when music is selected
    setShowTrimmer(true);
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

  // Handle music library selection
  const handleMusicLibrarySelect = (musicTrack: MusicTrack) => {
    setCurrentMusicTrack(musicTrack);
    setError(null);
    onMusicChange(musicTrack.url);
    setIsPlaying(false);
    setShowTrimmer(true);
    setAudioDuration(musicTrack.duration);
  };

  const handleRemoveMusic = () => {
    setCurrentMusicTrack(null);
    setError(null);
    onMusicChange(undefined);
    setIsPlaying(false);
  };

  return (
    <div className="bg-card/90 backdrop-blur-sm rounded-lg p-6 border border-border/50 max-w-3xl mx-auto">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Background Music</h3>
      
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
          <div className="bg-muted/80 rounded-lg p-4 border border-border/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <button
                  onClick={togglePlayback}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg flex-shrink-0"
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
                <div className="min-w-0 flex-1">
                  <div 
                    className="text-sm font-medium text-foreground truncate" 
                    title={currentMusicTrack ? currentMusicTrack.title : 'Preset Music'}
                  >
                    {currentMusicTrack ? currentMusicTrack.title : 'Preset Music'}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center space-x-2">
                    <span>
                      {currentMusicTrack ? 'From Library' : 'Built-in Track'}
                    </span>
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Duration: {Math.round(audioDuration)}s
              </div>
              <button
                onClick={() => setShowTrimmer(!showTrimmer)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg text-sm text-white transition-all duration-200 shadow-lg hover:shadow-purple-500/25 hover:scale-105 flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.5,5.6L5,7L6.4,8.5L8.9,7.1L7.5,5.6M12,1V3H11V1H12M18.5,5.6L17.1,7.1L19.6,8.5L21,7L18.5,5.6M4.5,10.5V11.5H2.5V10.5H4.5M21.5,10.5H19.5V11.5H21.5V10.5M6.4,14.5L5,16L7.5,17.4L8.9,15.9L6.4,14.5M17.1,15.9L18.5,17.4L21,16L19.6,14.5L17.1,15.9M11,21H12V23H11V21Z"/>
                </svg>
                <span>{showTrimmer ? 'Hide Trimmer' : 'Show Trimmer'}</span>
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
          <label className="block text-sm font-medium mb-2 text-foreground">
            Music Volume: {Math.round(volume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Music Library Section */}
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Select Music
          </label>
          {/* Music Library Button */}
          <button
            onClick={() => setShowMusicLibrary(true)}
            className="w-full border-2 border-dashed rounded-lg px-4 py-6 text-center transition-all duration-200 border-border/50 bg-muted/80 hover:bg-muted/90 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10"
          >
            <div className="flex flex-col items-center justify-center space-y-2 text-foreground">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-sm font-medium">Music Library</span>
              <span className="text-xs text-muted-foreground">Upload & select from your music</span>
            </div>
          </button>
        </div>

        {/* Preset Music Options */}
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Or Choose Preset Music
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        : 'border-border/50 bg-muted/80 text-muted-foreground hover:border-border/70 hover:bg-muted/90 hover:scale-105'
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
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-500/30 space-y-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
                </svg>
                <h4 className="text-sm font-semibold text-purple-200">Audio Trimmer</h4>
              </div>
              <div className="text-xs text-purple-300 bg-purple-900/40 px-2 py-1 rounded">
                Trim: {Math.round(trimStart)}s - {Math.round(trimEnd || audioDuration)}s
              </div>
            </div>
            
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
            
            <div className="flex justify-between items-center pt-2 border-t border-purple-500/20">
              <div className="text-xs text-purple-300">
                Trimmed Duration: {Math.round((trimEnd || audioDuration) - trimStart)}s
              </div>
              <button
                onClick={() => {
                  handleTrimChange(0, audioDuration);
                }}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Reset Trim
              </button>
            </div>
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

      {/* Music Library Dialog */}
      <MusicLibraryDialog
        isOpen={showMusicLibrary}
        onClose={() => setShowMusicLibrary(false)}
        onMusicSelect={handleMusicLibrarySelect}
        userId="demo-user" // TODO: Get from auth context
      />
    </div>
  );
};