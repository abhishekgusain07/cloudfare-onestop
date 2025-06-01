/**
 * Utility functions for video handling
 */

/**
 * Get video duration in seconds
 * @param videoUrl URL of the video file
 * @returns Promise resolving to duration in seconds
 */
export const getVideoDuration = async (videoUrl: string): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      resolve(video.duration);
      window.URL.revokeObjectURL(video.src);
    };
    
    // Handle errors
    video.onerror = () => {
      console.error(`Error loading video metadata for ${videoUrl}`);
      resolve(15); // Default to 15 seconds if metadata can't be loaded
      window.URL.revokeObjectURL(video.src);
    };
    
    video.src = videoUrl;
  });
};

/**
 * Get all videos from a directory
 * @param directoryPath Path to directory containing videos
 * @returns Array of video objects with id, name, url, and thumbnail
 */
export const getVideosFromDirectory = async (directoryPath: string) => {
  try {
    // In a real application, you would fetch this from an API
    // For now, we'll return a static list based on the directory structure
    const response = await fetch(`/api/videos?directory=${encodeURIComponent(directoryPath)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};
