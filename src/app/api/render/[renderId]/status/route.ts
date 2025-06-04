import { NextRequest } from 'next/server';
import { getRenderInfo } from '../../route';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: { renderId: string } }) {
  const renderId = params.renderId;
  
  // Fetch render status from database/cache
  const renderInfo = await getRenderInfo(renderId);
  
  if (!renderInfo) {
    return Response.json({ status: 'not_found' }, { status: 404 });
  }
  
  // For AWS Lambda rendering
  if (renderInfo.lambdaRenderID) {
    try {
      // Import dynamically to avoid issues with server components
      const { getRenderProgress } = await import('@remotion/lambda');
      
      // Type assertion for region to handle the strict type requirement
      const region = process.env.REMOTION_AWS_REGION as
        | 'us-east-1' | 'us-east-2' | 'us-west-1' | 'us-west-2'
        | 'eu-central-1' | 'eu-west-1' | 'eu-west-2' | 'eu-west-3'
        | 'ap-northeast-1' | 'ap-northeast-2' | 'ap-south-1'
        | 'ap-southeast-1' | 'ap-southeast-2'
        | undefined;
      
      const progress = await getRenderProgress({
        renderId: renderInfo.lambdaRenderID,
        bucketName: renderInfo.bucketName,
        functionName: process.env.REMOTION_AWS_FUNCTION_NAME!,
        region: region!,
      });
      
      // The downloadUrl might come from renderInfo instead of progress
      return Response.json({
        status: progress.overallProgress === 1 ? 'completed' : 'rendering',
        progress: Math.round(progress.overallProgress * 100),
        downloadUrl: renderInfo.downloadUrl || `/renders/${renderId}.mp4`,
      });
    } catch (error) {
      console.error('Error getting Lambda render progress:', error);
      return Response.json({ 
        status: 'error', 
        error: 'Failed to get Lambda render progress' 
      }, { status: 500 });
    }
  }
  
  // For local rendering
  if (renderInfo.status === 'completed') {
    // Check if the file exists
    const videoPath = path.join(process.cwd(), 'public', 'renders', `${renderId}.mp4`);
    const fileExists = fs.existsSync(videoPath);
    
    return Response.json({
      status: 'completed',
      progress: 100,
      downloadUrl: `/renders/${renderId}.mp4`,
      fileReady: fileExists,
    });
  }
  
  if (renderInfo.status === 'rendering') {
    return Response.json({
      status: 'rendering',
      progress: renderInfo.progress || 0,
    });
  }
  
  if (renderInfo.status === 'failed') {
    return Response.json({
      status: 'failed',
      error: renderInfo.error || 'Unknown error',
    });
  }
  
  return Response.json({ status: renderInfo.status || 'unknown' });
}
  