'use client';

import React, { useState, useEffect } from 'react';
import { Play, Film } from 'lucide-react';

interface Video {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string; // Added for R2 thumbnails
  size: number;
  filename: string;
}

interface VideoSelectorProps {
  selectedVideo: string | null;
  onVideoSelect: (video: Video) => void;
  className?: string;
}

export const VideoSelector: React.FC<VideoSelectorProps> = ({
  selectedVideo,
  onVideoSelect,
  className = ''
}) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  // Add thumbnail loading and error state management
  const [thumbnailErrors, setThumbnailErrors] = useState<Set<string>>(new Set());
  const [thumbnailLoading, setThumbnailLoading] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/videos');
      const data = await response.json();
      
      if (data.success) {
        // Enhanced logging to debug thumbnailUrl values
        console.log(`✅ Fetched ${data.videos.length} videos from R2`);
        console.log('Sample video with thumbnail data:', data.videos[0]);
        
        // Debug: Log all thumbnailUrl values to check if they're being set correctly
        const videosWithThumbnails = data.videos.filter((v: Video) => v.thumbnailUrl);
        const videosWithoutThumbnails = data.videos.filter((v: Video) => !v.thumbnailUrl);
        console.log(`📸 Videos with thumbnails: ${videosWithThumbnails.length}`);
        console.log(`❌ Videos without thumbnails: ${videosWithoutThumbnails.length}`);
        
        if (videosWithThumbnails.length > 0) {
          console.log('Sample thumbnail URL:', videosWithThumbnails[0].thumbnailUrl);
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

  // Simplified thumbnail error handling using React state
  const handleThumbnailError = (videoId: string) => {
    console.log('Thumbnail failed to load for video:', videoId);
    setThumbnailErrors(prev => new Set([...prev, videoId]));
    setThumbnailLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(videoId);
      return newSet;
    });
  };

  const handleThumbnailLoad = (videoId: string) => {
    console.log('Thumbnail loaded successfully for video:', videoId);
    console.log('Thumbnail URL:', videos.find(v => v.id === videoId)?.thumbnailUrl);
    setThumbnailLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(videoId);
      return newSet;
    });
  };

  const handleThumbnailLoadStart = (videoId: string) => {
    setThumbnailLoading(prev => new Set([...prev, videoId]));
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

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
          <div
            key={video.id}
            className={`relative group cursor-pointer rounded-lg border-2 transition-all duration-200 ${
              selectedVideo === video.filename
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            onClick={() => onVideoSelect(video)}
          >
            {/* Video Thumbnail/Preview */}
            <div className="aspect-video bg-gray-100 rounded-t-lg relative overflow-hidden">
              {previewVideo === video.filename ? (
                <video
                  src={video.url}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  onError={() => setPreviewVideo(null)}
                />
              ) : (
                // Simplified thumbnail rendering logic
                <>
                  {!thumbnailErrors.has(video.id) && video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={`Thumbnail for Video ${video.id}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onLoadStart={() => handleThumbnailLoadStart(video.id)}
                      onLoad={() => handleThumbnailLoad(video.id)}
                      onError={() => handleThumbnailError(video.id)}
                    />
                  ) : (
                    // Clean fallback UI
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  )}
                  
                  {/* Loading indicator for thumbnails */}
                  {thumbnailLoading.has(video.id) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    </div>
                  )}
                </>
              )}
              
              {/* Hover overlay */}
              <div 
                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center"
                onMouseEnter={() => setPreviewVideo(video.filename)}
                onMouseLeave={() => setPreviewVideo(null)}
              >
                <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
              
              {/* Selected indicator */}
              {selectedVideo === video.filename && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
            
            {/* Video Info */}
            <div className="p-2">
              <div className="font-medium text-sm text-gray-900 truncate">
                Video {video.id}
              </div>
              <div className="text-xs text-gray-500">
                {formatFileSize(video.size)}
              </div>
            </div>
          </div>
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