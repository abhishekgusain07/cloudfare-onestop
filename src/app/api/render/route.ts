import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

interface RenderRequest {
  videoParams: {
    selectedTemplate: string;
    text: string;
    textPosition: 'top' | 'center' | 'bottom';
    textAlign: 'left' | 'center' | 'right';
    fontSize: number;
    textColor: string;
    musicUrl?: string;
    musicVolume: number;
  };
  template: {
    id: string;
    name: string;
    url: string;
    duration: number;
  };
}

interface RenderResponse {
  success: boolean;
  renderId?: string;
  downloadUrl?: string;
  error?: string;
  progress?: number;
}

// Define a global type for the render cache
declare global {
  var renderCache: Record<string, any>;
}

// Helper function to store render information
async function storeRenderInfo(renderId: string, renderInfo: any) {
  if (typeof global.renderCache === 'undefined') {
    global.renderCache = {};
  }
  
  global.renderCache[renderId] = renderInfo;
  console.log('Storing render info:', { renderId, renderInfo });
  return renderInfo;
}

// Export function to get render information for a specific render ID
export async function getRenderInfo(renderId: string) {
  if (typeof global.renderCache === 'undefined') {
    return null;
  }
  
  return global.renderCache[renderId] || null;
}

export async function POST(req: NextRequest): Promise<NextResponse<RenderResponse>> {
  try {
    const body = await req.json();
    const { videoParams, template } = body as RenderRequest;

    // Validate request
    if (!videoParams || !template) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing video parameters or template' 
      }, { status: 400 });
    }

    // Generate unique render ID
    const renderId = `render_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Local Server-Side Rendering Implementation
    try {
      // Make sure the renders directory exists
      const rendersDir = path.resolve('./public/renders');
      if (!fs.existsSync(rendersDir)) {
        fs.mkdirSync(rendersDir, { recursive: true });
      }
      
      // Store render info as starting
      await storeRenderInfo(renderId, {
        status: 'rendering',
        progress: 0,
        params: videoParams,
        template,
        createdAt: new Date(),
      });
      
      // Start the rendering process asynchronously
      (async () => {
        try {
          console.log('Starting local rendering process for:', renderId);
          
          // Update progress
          await storeRenderInfo(renderId, {
            status: 'rendering',
            progress: 10,
            params: videoParams,
            template,
            createdAt: new Date(),
          });
          
          // Create the bundle
          const bundleLocation = await bundle({
            entryPoint: path.resolve('./src/components/remotion/videoComposition.tsx'),
            webpackOverride: (config) => config,
          });
          
          console.log('Bundle created at:', bundleLocation);
          
          // Update progress
          await storeRenderInfo(renderId, {
            status: 'rendering',
            progress: 30,
            params: videoParams,
            template,
            createdAt: new Date(),
          });
          
          // Select the composition
          const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: 'VideoComposition',
            inputProps: {
              ...videoParams,
              templateUrl: template.url,
            },
          });
          
          console.log('Composition selected:', composition);
          
          // Update progress
          await storeRenderInfo(renderId, {
            status: 'rendering',
            progress: 50,
            params: videoParams,
            template,
            createdAt: new Date(),
          });
          
          // Set output path
          const outputPath = path.resolve(`./public/renders/${renderId}.mp4`);
          
          // Render the video
          await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: outputPath,
            inputProps: {
              ...videoParams,
              templateUrl: template.url,
            },
            onProgress: ({ renderedFrames, encodedFrames }) => {
              // Calculate progress based on encoded frames if available, otherwise use rendered frames
              const totalFrames = composition.durationInFrames;
              const progress = encodedFrames 
                ? Math.round((encodedFrames / totalFrames) * 100)
                : Math.round((renderedFrames / totalFrames) * 100);
              
              console.log(`Render progress for ${renderId}: ${progress}% (${renderedFrames}/${totalFrames} frames)`);
              
              // Update progress in cache
              storeRenderInfo(renderId, {
                status: 'rendering',
                progress: Math.min(progress, 99), // Cap at 99% until complete
                params: videoParams,
                template,
                createdAt: new Date(),
              });
            },
          });
          
          // Update render status to completed
          await storeRenderInfo(renderId, {
            status: 'completed',
            progress: 100,
            params: videoParams,
            template,
            createdAt: new Date(),
            completedAt: new Date(),
            downloadUrl: `/renders/${renderId}.mp4`,
          });
          
          console.log(`Render ${renderId} completed successfully`);
        } catch (error) {
          console.error(`Render ${renderId} failed:`, error);
          await storeRenderInfo(renderId, {
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
            params: videoParams,
            template,
            createdAt: new Date(),
            completedAt: new Date(),
          });
        }
      })().catch(console.error);
      
      // Return immediate response while rendering continues in background
      return NextResponse.json({
        success: true,
        renderId,
        downloadUrl: `/renders/${renderId}.mp4`,
      });
      
    } catch (error) {
      console.error('Local rendering setup error:', error);
      return NextResponse.json({
        success: false,
        error: `Failed to set up local rendering: ${error instanceof Error ? error.message : String(error)}`,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Render error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during rendering',
    }, { status: 500 });
  }
}

// GET endpoint to check render status
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const renderId = searchParams.get('renderId');
  
  if (!renderId) {
    return NextResponse.json({ 
      success: false, 
      error: 'Missing renderId parameter' 
    }, { status: 400 });
  }
  
  try {
    const renderInfo = await getRenderInfo(renderId);
    
    if (!renderInfo) {
      return NextResponse.json({ 
        success: false, 
        error: 'Render not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      ...renderInfo,
    });
  } catch (error) {
    console.error('Error fetching render info:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch render information',
    }, { status: 500 });
  }
}