import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MediaAsset {
  id: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  duration?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  name: string;
}

export interface TimelineTrack {
  id: string;
  type: 'video' | 'audio' | 'text';
  clips: {
    id: string;
    assetId: string;
    startTime: number;
    duration: number;
    offset: number;
  }[];
}

export interface TextElement {
  id: string;
  content: string;
  style: {
    fontFamily: string;
    fontSize: number;
    color: string;
    position: {
      x: number;
      y: number;
    };
  };
  startTime: number;
  duration: number;
}

interface EditorState {
  assets: MediaAsset[];
  tracks: TimelineTrack[];
  selectedAsset: string | null;
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  addAsset: (asset: MediaAsset) => void;
  removeAsset: (id: string) => void;
  addTrack: (track: TimelineTrack) => void;
  removeTrack: (id: string) => void;
  updateTrack: (id: string, updates: Partial<TimelineTrack>) => void;
  setSelectedAsset: (id: string | null) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setDuration: (duration: number) => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      assets: [],
      tracks: [],
      selectedAsset: null,
      currentTime: 0,
      isPlaying: false,
      duration: 0,
      addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
      removeAsset: (id) =>
        set((state) => ({ assets: state.assets.filter((a) => a.id !== id) })),
      addTrack: (track) => set((state) => ({ tracks: [...state.tracks, track] })),
      removeTrack: (id) =>
        set((state) => ({ tracks: state.tracks.filter((t) => t.id !== id) })),
      updateTrack: (id, updates) =>
        set((state) => ({
          tracks: state.tracks.map((track) =>
            track.id === id ? { ...track, ...updates } : track
          ),
        })),
      setSelectedAsset: (id) => set({ selectedAsset: id }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setDuration: (duration) => set({ duration }),
    }),
    {
      name: 'video-editor-storage',
    }
  )
); 