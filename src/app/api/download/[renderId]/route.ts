import { NextRequest } from 'next/server';
import { getRenderInfo } from '../../render/route';

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
  
  // For local development/testing, we can simulate a download
  // In a real implementation, you would serve the actual file from storage
  if (renderInfo.status === 'completed') {
    // Create a mock video response for demonstration purposes
    // In production, you would serve the actual file from your storage
    return new Response(
      `This is a simulated video download for render ID: ${renderId}\n` +
      `In production, this would be a real video file.\n` +
      `Video parameters: ${JSON.stringify(renderInfo.params, null, 2)}`,
      {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="video-${renderId}.txt"`,
        },
      }
    );
  }
  
  // If the video is still rendering
  if (renderInfo.status === 'rendering') {
    return Response.json({
      error: 'Video is still rendering',
      status: 'rendering',
    }, { status: 202 });
  }
  
  return new Response('Video not available', { status: 404 });
}