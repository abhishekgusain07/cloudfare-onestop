import { useState, useEffect, useCallback, useRef } from 'react';
import { VideoParams } from '@/app/create/page';
import {
  EditorState,
  createDefaultEditorState,
  saveEditorState,
  loadEditorState,
  clearEditorState,
  createAutoSave,
  isStorageAvailable,
  getSessionSummary,
  isSessionStale,
} from '@/utils/sessionPersistence';

interface UseEditorStateReturn {
  // State
  editorState: EditorState;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  isStorageEnabled: boolean;
  
  // Video state
  selectedVideo: EditorState['selectedVideo'];
  videoParams: VideoParams;
  
  // Music state
  musicState: EditorState['musicState'];
  
  // Actions
  updateVideoParams: (updates: Partial<VideoParams>) => void;
  updateMusicState: (updates: Partial<EditorState['musicState']>) => void;
  setSelectedVideo: (video: EditorState['selectedVideo']) => void;
  
  // Session management
  saveSession: () => void;
  loadSession: () => void;
  clearSession: () => void;
  resetToDefault: () => void;
  
  // Session info
  getSessionInfo: () => {
    summary: string;
    age: number;
    isStale: boolean;
  };
}

export const useEditorState = (): UseEditorStateReturn => {
  const [editorState, setEditorState] = useState<EditorState>(createDefaultEditorState());
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isStorageEnabled = isStorageAvailable();
  
  // Auto-save function with debouncing
  const autoSaveRef = useRef(createAutoSave((state: EditorState) => {
    if (isStorageEnabled) {
      saveEditorState(state);
      setHasUnsavedChanges(false);
    }
  }, 1000));

  // Load session on mount
  useEffect(() => {
    const loadInitialState = async () => {
      setIsLoading(true);
      
      if (isStorageEnabled) {
        const savedState = loadEditorState();
        if (savedState) {
          // Check if session is stale
          if (isSessionStale(savedState)) {
            console.log('⚠️ Session is stale, using default state');
            setEditorState(createDefaultEditorState());
          } else {
            setEditorState(savedState);
            console.log('✅ Session restored:', getSessionSummary(savedState));
          }
        } else {
          setEditorState(createDefaultEditorState());
        }
      } else {
        console.log('⚠️ localStorage not available, using memory-only state');
        setEditorState(createDefaultEditorState());
      }
      
      setIsLoading(false);
    };

    loadInitialState();
  }, [isStorageEnabled]);

  // Auto-save when state changes
  useEffect(() => {
    if (!isLoading && isStorageEnabled) {
      setHasUnsavedChanges(true);
      autoSaveRef.current(editorState);
    }
  }, [editorState, isLoading, isStorageEnabled]);

  // Update video parameters
  const updateVideoParams = useCallback((updates: Partial<VideoParams>) => {
    setEditorState(prev => ({
      ...prev,
      videoParams: {
        ...prev.videoParams,
        ...updates,
      },
      lastModified: new Date(),
    }));
  }, []);

  // Update music state
  const updateMusicState = useCallback((updates: Partial<EditorState['musicState']>) => {
    setEditorState(prev => ({
      ...prev,
      musicState: {
        ...prev.musicState,
        ...updates,
      },
      lastModified: new Date(),
    }));
  }, []);

  // Set selected video
  const setSelectedVideo = useCallback((video: EditorState['selectedVideo']) => {
    setEditorState(prev => ({
      ...prev,
      selectedVideo: video,
      videoParams: {
        ...prev.videoParams,
        selectedTemplate: video?.filename || '',
      },
      lastModified: new Date(),
    }));
  }, []);

  // Manual save session
  const saveSession = useCallback(() => {
    if (isStorageEnabled) {
      saveEditorState(editorState);
      setHasUnsavedChanges(false);
      console.log('💾 Session saved manually');
    }
  }, [editorState, isStorageEnabled]);

  // Load session
  const loadSession = useCallback(() => {
    if (isStorageEnabled) {
      const savedState = loadEditorState();
      if (savedState) {
        setEditorState(savedState);
        setHasUnsavedChanges(false);
        console.log('📂 Session loaded manually');
      }
    }
  }, [isStorageEnabled]);

  // Clear session
  const clearSession = useCallback(() => {
    if (isStorageEnabled) {
      clearEditorState();
    }
    setEditorState(createDefaultEditorState());
    setHasUnsavedChanges(false);
    console.log('🗑️ Session cleared');
  }, [isStorageEnabled]);

  // Reset to default
  const resetToDefault = useCallback(() => {
    setEditorState(createDefaultEditorState());
    setHasUnsavedChanges(false);
    console.log('🔄 Reset to default state');
  }, []);

  // Get session info
  const getSessionInfo = useCallback(() => {
    return {
      summary: getSessionSummary(editorState),
      age: Date.now() - editorState.lastModified.getTime(),
      isStale: isSessionStale(editorState),
    };
  }, [editorState]);

  return {
    // State
    editorState,
    isLoading,
    hasUnsavedChanges,
    isStorageEnabled,
    
    // Convenient state access
    selectedVideo: editorState.selectedVideo,
    videoParams: editorState.videoParams,
    musicState: editorState.musicState,
    
    // Actions
    updateVideoParams,
    updateMusicState,
    setSelectedVideo,
    
    // Session management
    saveSession,
    loadSession,
    clearSession,
    resetToDefault,
    
    // Session info
    getSessionInfo,
  };
};

// Additional hook for music-specific state management
export const useMusicState = (editorState: UseEditorStateReturn) => {
  const {
    updateVideoParams,
    updateMusicState,
    videoParams,
    musicState,
  } = editorState;

  // Handle music selection
  const handleMusicSelect = useCallback((musicUrl?: string) => {
    updateVideoParams({ musicUrl });
    
    // Reset trimming when music changes
    if (musicUrl !== videoParams.musicUrl) {
      updateVideoParams({
        musicStartTime: undefined,
        musicEndTime: undefined,
      });
      updateMusicState({
        showTrimmer: false,
      });
    }
  }, [updateVideoParams, updateMusicState, videoParams.musicUrl]);

  // Handle volume change
  const handleVolumeChange = useCallback((musicVolume: number) => {
    updateVideoParams({ musicVolume });
  }, [updateVideoParams]);

  // Handle trimming change
  const handleTrimChange = useCallback((startTime: number, endTime: number) => {
    updateVideoParams({
      musicStartTime: startTime,
      musicEndTime: endTime,
    });
  }, [updateVideoParams]);

  // Handle trimmer visibility
  const handleTrimmerToggle = useCallback((show: boolean) => {
    updateMusicState({ showTrimmer: show });
  }, [updateMusicState]);

  // Handle audio duration update
  const handleAudioDurationUpdate = useCallback((duration: number) => {
    updateMusicState({ audioDuration: duration });
  }, [updateMusicState]);

  return {
    // Music state
    musicUrl: videoParams.musicUrl,
    musicVolume: videoParams.musicVolume,
    musicStartTime: videoParams.musicStartTime,
    musicEndTime: videoParams.musicEndTime,
    audioDuration: musicState.audioDuration,
    showTrimmer: musicState.showTrimmer,
    
    // Music handlers
    handleMusicSelect,
    handleVolumeChange,
    handleTrimChange,
    handleTrimmerToggle,
    handleAudioDurationUpdate,
  };
};

// Hook for video state management
export const useVideoState = (editorState: UseEditorStateReturn) => {
  const {
    updateVideoParams,
    setSelectedVideo,
    selectedVideo,
    videoParams,
  } = editorState;

  // Handle video selection
  const handleVideoSelect = useCallback((video: any) => {
    setSelectedVideo(video);
  }, [setSelectedVideo]);

  // Handle text changes
  const handleTextChange = useCallback((text: string) => {
    updateVideoParams({ text });
  }, [updateVideoParams]);

  // Handle position changes
  const handlePositionChange = useCallback((textPosition: 'top' | 'center' | 'bottom') => {
    updateVideoParams({ textPosition });
  }, [updateVideoParams]);

  // Handle alignment changes
  const handleAlignmentChange = useCallback((textAlign: 'left' | 'center' | 'right') => {
    updateVideoParams({ textAlign });
  }, [updateVideoParams]);

  // Handle font size changes
  const handleFontSizeChange = useCallback((fontSize: number) => {
    updateVideoParams({ fontSize });
  }, [updateVideoParams]);

  // Handle color changes
  const handleColorChange = useCallback((textColor: string) => {
    updateVideoParams({ textColor });
  }, [updateVideoParams]);

  // Handle opacity changes
  const handleOpacityChange = useCallback((textOpacity: number) => {
    updateVideoParams({ textOpacity });
  }, [updateVideoParams]);

  return {
    // Video state
    selectedVideo,
    videoParams,
    
    // Video handlers
    handleVideoSelect,
    handleTextChange,
    handlePositionChange,
    handleAlignmentChange,
    handleFontSizeChange,
    handleColorChange,
    handleOpacityChange,
  };
};