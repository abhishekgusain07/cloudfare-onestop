import React, { useRef, useState } from 'react';

interface MusicSelectorProps {
  musicUrl?: string;
  volume: number;
  selectedMusic?: string;
  onMusicChange: (musicUrl?: string) => void;
  onVolumeChange: (volume: number) => void;
}

export const MusicSelector: React.FC<MusicSelectorProps> = ({
  musicUrl,
  volume,
  selectedMusic,
  onMusicChange,
  onVolumeChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
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
    if (file && file.type.startsWith('audio/')) {
      setCurrentFile(file);
      const url = URL.createObjectURL(file);
      onMusicChange(url);
    }
  };

  const handlePresetSelect = (url: string) => {
    setCurrentFile(null);
    onMusicChange(url);
    setIsPlaying(false);
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

            {/* Hidden audio element for preview */}
            {musicUrl && (
              <audio
                ref={audioRef}
                src={musicUrl}
                onEnded={() => setIsPlaying(false)}
                onLoadStart={() => setIsPlaying(false)}
              />
            )}
          </div>
        )}

        {/* Volume Control */}
        <div>
          <label className="block text-sm font-medium mb-2 text-black">
            Music Volume: {Math.round(volume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-black mt-1">
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
              className="flex-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 rounded-lg px-4 py-3 text-center transition-all duration-200 hover:border-slate-500/70"
            >
              <div className="flex items-center justify-center space-x-2 text-slate-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                <span>Choose Audio File</span>
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
            {presetMusic.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.url)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all hover:scale-105 ${
                  musicUrl === preset.url
                    ? 'border-purple-400 bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-400/25'
                    : 'border-slate-600/50 bg-slate-800/80 text-slate-300 hover:border-slate-500/70 hover:bg-slate-700/80'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                  <span>{preset.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Music Tips */}
        <div className="bg-blue-950/40 border border-blue-800/50 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-black mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17A1.5,1.5 0 0,1 10.5,15.5A1.5,1.5 0 0,1 12,14A1.5,1.5 0 0,1 13.5,15.5A1.5,1.5 0 0,1 12,17M14.5,10.5C14.5,9.5 13.75,8.75 12.75,8.75H11.25C10.25,8.75 9.5,9.5 9.5,10.5V11H11V10.5H13V11.5H11V13H13V11.5C13.75,11.5 14.5,10.75 14.5,10V10.5Z"/>
            </svg>
            <div className="text-sm">
              <div className="font-medium text-black mb-1">Music Tips</div>
              <ul className="text-black space-y-1 text-xs">
                <li>• Keep music volume balanced with video audio</li>
                <li>• Choose music that matches your video's mood</li>
                <li>• Consider copyright when using custom music</li>
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