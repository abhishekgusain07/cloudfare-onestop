import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Function to get video duration using ffprobe
async function getVideoDuration(filePath: string): Promise<number> {
  try {
    const { stdout } = await execPromise(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
    );
    return parseFloat(stdout.trim());
  } catch (error) {
    console.error(`Error getting duration for ${filePath}:`, error);
    return 15; // Default to 15 seconds if ffprobe fails
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
      return NextResponse.json(
        { error: `Directory ${directory} not found` },
        { status: 404 }
      );
    }
    
    // Get all files in the directory
    const files = fs.readdirSync(dirPath);
    
    // Filter for video files
    const videoExtensions = ['.mp4', '.webm', '.mov'];
    const videoFiles = files.filter(file => 
      videoExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );
    
    // Create video objects with metadata
    const videos = await Promise.all(
      videoFiles.map(async (file, index) => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        // Get duration using ffprobe
        const duration = await getVideoDuration(filePath);
        
        // Generate a thumbnail path - in a real app, you'd have actual thumbnails
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
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
