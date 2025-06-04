import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Hardcoded sample videos to use when the directory doesn't exist
const sampleVideos = [
  {
    id: 'template1',
    name: 'Beach Sunset',
    url: 'https://res.cloudinary.com/demo/video/upload/v1689413519/samples/sea-turtle.mp4',
    duration: 15,
    thumbnail: '/thumbnails/default.jpg',
    size: 1000000,
    created: new Date(),
  },
  {
    id: 'template2',
    name: 'Mountain View',
    url: 'https://res.cloudinary.com/demo/video/upload/v1689413519/samples/elephants.mp4',
    duration: 20,
    thumbnail: '/thumbnails/default.jpg',
    size: 1200000,
    created: new Date(),
  },
  {
    id: 'template3',
    name: 'City Timelapse',
    url: 'https://res.cloudinary.com/demo/video/upload/v1689413519/samples/cld-sample-video.mp4',
    duration: 10,
    thumbnail: '/thumbnails/default.jpg',
    size: 800000,
    created: new Date(),
  }
];

// Function to get video duration without ffprobe
async function getVideoDuration(filePath: string): Promise<number> {
  // Since we can't reliably get the duration without ffprobe,
  // we'll use a default value based on the file size as a rough estimate
  try {
    const stats = fs.statSync(filePath);
    // Very rough estimate: 1MB ≈ 5 seconds of video at moderate quality
    const estimatedDuration = Math.max(5, Math.round(stats.size / (1024 * 1024) * 5));
    return Math.min(estimatedDuration, 60); // Cap at 60 seconds to be safe
  } catch (error) {
    console.error(`Error estimating duration for ${filePath}:`, error);
    return 15; // Default to 15 seconds
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const directory = searchParams.get('directory') || '/ugc/videos';
    
    // Remove leading slash if it exists
    const normalizedDirectory = directory.startsWith('/') 
      ? directory.substring(1) 
      : directory;
    
    // Get absolute path to the directory
    const dirPath = path.join(process.cwd(), 'public', normalizedDirectory);
    
    // Check if directory exists
    if (!fs.existsSync(dirPath)) {
      console.log(`Directory ${dirPath} not found, returning sample videos`);
      // Return sample videos instead of failing
      return NextResponse.json(sampleVideos);
    }
    
    // Create the thumbnails directory if it doesn't exist
    const thumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails');
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }
    
    // Get all files in the directory
    const files = fs.readdirSync(dirPath);
    
    // Filter for video files
    const videoExtensions = ['.mp4', '.webm', '.mov'];
    const videoFiles = files.filter(file => 
      videoExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );
    
    // If no video files found, return sample videos
    if (videoFiles.length === 0) {
      console.log(`No video files found in ${dirPath}, returning sample videos`);
      return NextResponse.json(sampleVideos);
    }
    
    // Create video objects with metadata
    const videos = await Promise.all(
      videoFiles.map(async (file, index) => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        // Get estimated duration
        const duration = await getVideoDuration(filePath);
        
        // Generate a thumbnail path
        const fileNameWithoutExt = path.parse(file).name;
        const thumbnailPath = `/thumbnails/${fileNameWithoutExt}.jpg`;
        
        return {
          id: `template${index + 1}`,
          name: fileNameWithoutExt.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          url: `/${normalizedDirectory}/${file}`,
          duration: Math.round(duration),
          thumbnail: fs.existsSync(path.join(process.cwd(), 'public', 'thumbnails', `${fileNameWithoutExt}.jpg`))
            ? thumbnailPath
            : '/thumbnails/default.jpg',
          size: stats.size,
          created: stats.birthtime,
        };
      })
    );
    
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    // Return sample videos on error instead of failing
    console.log('Returning sample videos due to error');
    return NextResponse.json(sampleVideos);
  }
}
