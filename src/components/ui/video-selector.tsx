'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Film } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Video {
  id: string;
  name: string;
  url: string;
  previewUrl?: string; // Added for optimized preview videos
  thumbnailUrl?: string; // Added for R2 thumbnails
  size: number;
  filename: string;
}

interface VideoSelectorProps {
  selectedVideo: string | null;
  onVideoSelect: (video: Video) => void;
  className?: string;
}

// Custom hook for intersection observer
const useIntersectionObserver = (options: IntersectionObserverInit = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1, ...options }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isIntersecting] as const;
};

// Video item component with lazy loading
const VideoItem: React.FC<{
  video: Video;
  isSelected: boolean;
  onSelect: (video: Video) => void;
  formatFileSize: (bytes: number) => string;
}> = ({ video, isSelected, onSelect, formatFileSize }) => {
  const [ref, isVisible] = useIntersectionObserver();
  const [previewVideo, setPreviewVideo] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);

  return (
    <div
      ref={ref}
      className={`relative group cursor-pointer rounded-lg border-2 transition-all duration-200 ${
        isSelected
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      onClick={() => onSelect(video)}
    >
      {/* Video Thumbnail/Preview */}
      <div className={cn(`aspect-[9/16] bg-gray-100 rounded-t-lg relative overflow-hidden hover:scale-105 transition-all duration-200 ${video.previewUrl ? 'hover:scale-105' : ''} `)}>
            <div className="flex items-center justify-center overflow-hidden">
              
              {video.thumbnailUrl && <img
                src={video.thumbnailUrl}
                alt={`Thumbnail for Video ${video.id}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onLoadStart={() => setThumbnailLoading(true)}
                onLoad={() => setThumbnailLoading(false)}
                onError={() => {
                  console.log(`Thumbnail failed for video ${video.id}`);
                  setThumbnailError(true);
                  setThumbnailLoading(false);
                }}
              />}
            </div>
      </div>
    </div>
  );
};

export const VideoSelector: React.FC<VideoSelectorProps> = ({
  selectedVideo,
  onVideoSelect,
  className = ''
}) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/videos`);
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Fetched ${data.videos.length} videos from R2`);
        console.log('Sample video data:', data.videos[0]);
        
        // Debug thumbnail URLs specifically
        const videosWithThumbnails = data.videos.filter((v: Video) => v.thumbnailUrl);
        const videosWithoutThumbnails = data.videos.filter((v: Video) => !v.thumbnailUrl);
        console.log(`📸 Videos with thumbnails: ${videosWithThumbnails.length}`);
        console.log(`❌ Videos without thumbnails: ${videosWithoutThumbnails.length}`);
        
        if (videosWithThumbnails.length > 0) {
          console.log('First 3 thumbnail URLs:', videosWithThumbnails.slice(0, 3).map((v: Video) => ({
            id: v.id,
            thumbnailUrl: v.thumbnailUrl
          })));
        }
        
        // Log videos that should have thumbnails but don't
        if (videosWithoutThumbnails.length > 0) {
          console.log('Videos missing thumbnails:', videosWithoutThumbnails.slice(0, 5).map((v: Video) => v.id));
        }
        
        setVideos(data.videos);
        // Auto-select first video if none selected
        if (!selectedVideo && data.videos.length > 0) {
          onVideoSelect(data.videos[0]);
        }
      } else {
        setError(data.error || 'Failed to fetch videos');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = useCallback((bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }, []);

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Film className="w-5 h-5" />
          Select Video Template
        </h3>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading videos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Film className="w-5 h-5" />
          Select Video Template
        </h3>
        <div className="text-center p-8">
          <div className="text-red-500 mb-2">⚠️ {error}</div>
          <button 
            onClick={fetchVideos}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Film className="w-5 h-5" />
        Select Video Template ({videos.length} available)
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
        {videos.map((video) => (
          <VideoItem
            key={video.id}
            video={video}
            isSelected={selectedVideo === video.filename}
            onSelect={onVideoSelect}
            formatFileSize={formatFileSize}
          />
        ))}
      </div>
      
      {videos.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          No videos found in the library
        </div>
      )}
    </div>
  );
}; 