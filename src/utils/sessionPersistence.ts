// Session persistence utilities for the AI UGC Studio

import { VideoParams } from '@/app/create/page';

export interface EditorState {
  // Video Selection
  selectedVideo: {
    id: string;
    name: string;
    url: string;
    previewUrl?: string;
    thumbnailUrl?: string;
    size: number;
    filename: string;
  } | null;
  
  // Video Parameters
  videoParams: VideoParams;
  
  // Music-specific state
  musicState: {
    audioDuration: number;
    showTrimmer: boolean;
    customFileName?: string;
    customFileSize?: number;
  };
  
  // Session Metadata
  sessionId: string;
  lastModified: Date;
  version: string;
}

// Storage keys
const STORAGE_KEY = 'ai-ugc-studio-session';
const STORAGE_VERSION = '1.0.0';

/**
 * Generate unique session ID
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create default editor state
 */
export const createDefaultEditorState = (): EditorState => {
  return {
    selectedVideo: null,
    videoParams: {
      selectedTemplate: '',
      text: 'Your brand message here...',
      textPosition: 'center',
      textAlign: 'center',
      fontSize: 48,
      textColor: '#ffffff',
      textOpacity: 1,
      musicVolume: 0.5,
      musicUrl: undefined,
      musicStartTime: undefined,
      musicEndTime: undefined,
    },
    musicState: {
      audioDuration: 30,
      showTrimmer: false,
    },
    sessionId: generateSessionId(),
    lastModified: new Date(),
    version: STORAGE_VERSION,
  };
};

/**
 * Save editor state to localStorage
 */
export const saveEditorState = (state: EditorState): void => {
  try {
    const stateToSave = {
      ...state,
      lastModified: new Date(),
      version: STORAGE_VERSION,
    };
    
    // Clean up any object URLs before saving (they won't work after refresh)
    const cleanedState = {
      ...stateToSave,
      videoParams: {
        ...stateToSave.videoParams,
        musicUrl: stateToSave.videoParams.musicUrl?.startsWith('blob:') 
          ? undefined 
          : stateToSave.videoParams.musicUrl,
      },
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedState));
    console.log('💾 Editor state saved successfully');
  } catch (error) {
    console.error('❌ Failed to save editor state:', error);
    // If storage is full, try to clear old data
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        console.log('🧹 Cleared old data and saved new state');
      } catch (retryError) {
        console.error('❌ Failed to save even after clearing:', retryError);
      }
    }
  }
};

/**
 * Load editor state from localStorage
 */
export const loadEditorState = (): EditorState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      console.log('📭 No saved editor state found');
      return null;
    }
    
    const parsed = JSON.parse(saved);
    
    // Version check
    if (parsed.version !== STORAGE_VERSION) {
      console.log('🔄 Editor state version mismatch, using default');
      return null;
    }
    
    // Validate structure
    if (!parsed.sessionId || !parsed.videoParams) {
      console.log('⚠️ Invalid editor state structure');
      return null;
    }
    
    // Convert date strings back to Date objects
    const state: EditorState = {
      ...parsed,
      lastModified: new Date(parsed.lastModified),
    };
    
    console.log('📂 Editor state loaded successfully');
    return state;
  } catch (error) {
    console.error('❌ Failed to load editor state:', error);
    return null;
  }
};

/**
 * Clear saved editor state
 */
export const clearEditorState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Editor state cleared');
  } catch (error) {
    console.error('❌ Failed to clear editor state:', error);
  }
};

/**
 * Check if localStorage is available
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = 'test-storage';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get storage usage information
 */
export const getStorageInfo = (): { used: number; available: number; percentage: number } => {
  if (!isStorageAvailable()) {
    return { used: 0, available: 0, percentage: 0 };
  }
  
  let used = 0;
  const available = 5 * 1024 * 1024; // 5MB typical localStorage limit
  
  try {
    // Calculate used space
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    const percentage = (used / available) * 100;
    return { used, available, percentage };
  } catch {
    return { used: 0, available, percentage: 0 };
  }
};

/**
 * Auto-save debounced function
 */
export const createAutoSave = (saveFunction: (state: EditorState) => void, delay: number = 1000) => {
  let timeoutId: NodeJS.Timeout;
  
  return (state: EditorState) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      saveFunction(state);
    }, delay);
  };
};

/**
 * Migration utilities for future versions
 */
export const migrateEditorState = (oldState: any, fromVersion: string): EditorState | null => {
  try {
    // Future migration logic would go here
    console.log(`🔄 Migrating from version ${fromVersion} to ${STORAGE_VERSION}`);
    
    // For now, just return null to force default state
    return null;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return null;
  }
};

/**
 * Export editor state for backup
 */
export const exportEditorState = (state: EditorState): string => {
  const exportData = {
    ...state,
    exportedAt: new Date().toISOString(),
    exportVersion: STORAGE_VERSION,
  };
  
  return JSON.stringify(exportData, null, 2);
};

/**
 * Import editor state from backup
 */
export const importEditorState = (jsonData: string): EditorState | null => {
  try {
    const imported = JSON.parse(jsonData);
    
    // Validate import structure
    if (!imported.sessionId || !imported.videoParams) {
      throw new Error('Invalid import format');
    }
    
    // Create new session ID for imported state
    const state: EditorState = {
      ...imported,
      sessionId: generateSessionId(),
      lastModified: new Date(),
      version: STORAGE_VERSION,
    };
    
    return state;
  } catch (error) {
    console.error('❌ Failed to import editor state:', error);
    return null;
  }
};

/**
 * Session recovery utilities
 */
export const getSessionAge = (state: EditorState): number => {
  return Date.now() - new Date(state.lastModified).getTime();
};

export const isSessionStale = (state: EditorState, maxAge: number = 24 * 60 * 60 * 1000): boolean => {
  return getSessionAge(state) > maxAge;
};

export const getSessionSummary = (state: EditorState): string => {
  const video = state.selectedVideo ? state.selectedVideo.name : 'No video selected';
  const music = state.videoParams.musicUrl ? 'With music' : 'No music';
  const trimmed = state.videoParams.musicStartTime !== undefined ? 'Trimmed' : 'Full track';
  
  return `${video} • ${music} ${music !== 'No music' ? `(${trimmed})` : ''}`;
};