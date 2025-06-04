import { NextRequest } from 'next/server';
import { getRenderInfo } from '../../render/route';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: { renderId: string } }) {
  const renderId = params.renderId;
  
  // Fetch render info and serve the video file
  const renderInfo = await getRenderInfo(renderId);
  
  if (!renderInfo) {
    return new Response('Video not found', { status: 404 });
  }
  
  // If using AWS Lambda, redirect to the S3 URL
  if (renderInfo.lambdaRenderID && renderInfo.downloadUrl) {
    return Response.redirect(renderInfo.downloadUrl);
  }
  
  // For local rendering, serve the actual file
  if (renderInfo.status === 'completed') {
    // Check if the file exists in the public/renders directory
    const videoPath = path.join(process.cwd(), 'public', 'renders', `${renderId}.mp4`);
    
    if (fs.existsSync(videoPath)) {
      // Read the file and serve it
      const videoBuffer = fs.readFileSync(videoPath);
      
      return new Response(videoBuffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="video-${renderId}.mp4"`,
        },
      });
    } else {
      console.error(`Video file not found at ${videoPath}`);
      return new Response('Video file not found', { status: 404 });
    }
  }
  
  // If the video is still rendering
  if (renderInfo.status === 'rendering') {
    const progress = renderInfo.progress || 0;
    return Response.json({
      error: 'Video is still rendering',
      status: 'rendering',
      progress,
    }, { status: 202 });
  }
  
  // If the rendering failed
  if (renderInfo.status === 'failed') {
    return Response.json({
      error: 'Video rendering failed',
      status: 'failed',
      message: renderInfo.error || 'Unknown error',
    }, { status: 500 });
  }
  
  return new Response('Video not available', { status: 404 });
}