
import { NextRequest, NextResponse } from 'next/server';
// For AWS Lambda rendering
import { renderMediaOnLambda, getRenderProgress } from '@remotion/lambda';

// For local server-side rendering (install: npm install @remotion/renderer)
// import { bundle } from '@remotion/bundler';
// import { renderMedia, selectComposition } from '@remotion/renderer';

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

export async function POST(req: NextRequest): Promise<NextResponse<RenderResponse>> {
  if (req.method !== 'POST') {
    return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
  }

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

    // Option 1: AWS Lambda Rendering (Recommended for production)
    if (process.env.REMOTION_AWS_REGION && process.env.REMOTION_AWS_FUNCTION_NAME) {
      try {
        const renderResponse = await renderMediaOnLambda({
          region: process.env.REMOTION_AWS_REGION as any, // Type assertion to avoid region enum constraint
          functionName: process.env.REMOTION_AWS_FUNCTION_NAME as string,
          composition: 'VideoComposition',
          serveUrl: process.env.REMOTION_SERVE_URL || 'http://localhost:3000',
          inputProps: {
            ...videoParams,
            templateUrl: template.url,
          },
          codec: 'h264',
          imageFormat: 'jpeg',
          maxRetries: 1,
          privacy: 'public',
          logLevel: 'warn',
          outName: `${renderId}.mp4`,
          timeoutInMilliseconds: 120000,
        });

        // Store render info in database or cache for progress tracking
        await storeRenderInfo(renderId, {
          status: 'rendering',
          lambdaRenderID: renderResponse.renderId,
          bucketName: renderResponse.bucketName,
          params: videoParams,
          template,
          createdAt: new Date(),
        });

        return NextResponse.json({
          success: true,
          renderId,
        });
      } catch (error) {
        console.error('Lambda rendering error:', error);
        return NextResponse.json({
          success: false,
          error: 'Lambda rendering failed. Check your AWS configuration.',
        }, { status: 500 });
      }
    }

    // Option 2: Local Server-Side Rendering (For development/small scale)
    /*
    const bundled = await bundle({
      entryPoint: path.resolve('./src/remotion/index.ts'),
      webpackOverride: (config) => config,
    });

    const composition = await selectComposition({
      serveUrl: bundled,
      id: 'VideoComposition',
      inputProps: {
        ...videoParams,
        templateUrl: template.url,
      },
    });

    const outputPath = path.resolve(`./public/renders/${renderId}.mp4`);

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        ...videoParams,
        templateUrl: template.url,
      },
      onProgress: ({ renderedFrames, totalFrames }) => {
        const progress = Math.round((renderedFrames / totalFrames) * 100);
        console.log(`Render progress: ${progress}%`);
        // Update progress in cache/database
      },
    });

    return res.status(200).json({
      success: true,
      renderId,
      downloadUrl: `/renders/${renderId}.mp4`,
    });
    */

    // Temporary mock response for development
    console.log('Render request received:', { renderId, videoParams, template });
    
    // Store render info for development/testing
    await storeRenderInfo(renderId, {
      status: 'rendering',
      params: videoParams,
      template,
      createdAt: new Date(),
    });
    
    // Simulate processing time
    setTimeout(async () => {
      // Update render status after "processing"
      await storeRenderInfo(renderId, {
        status: 'completed',
        params: videoParams,
        template,
        createdAt: new Date(),
        completedAt: new Date(),
        downloadUrl: `/api/download/${renderId}`,
      });
      console.log(`Render ${renderId} completed`);
    }, 5000);

    return NextResponse.json({
      success: true,
      renderId,
      // Mock download URL - replace with actual S3/storage URL
      downloadUrl: `/api/download/${renderId}`,
    });

  } catch (error) {
    console.error('Render error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during rendering',
    }, { status: 500 });
  }
}

// Define a global type for the render cache
declare global {
  var renderCache: Record<string, any>;
}

// Helper function to store render information (implement with your preferred database)
async function storeRenderInfo(renderId: string, renderInfo: any) {
  // In a real implementation, you would store this in a database
  // For now, we'll use a simple in-memory cache via global variable
  // Note: This is not production-ready and will reset on server restart
  if (typeof global.renderCache === 'undefined') {
    global.renderCache = {};
  }
  
  global.renderCache[renderId] = renderInfo;
  console.log('Storing render info:', { renderId, renderInfo });
  return renderInfo;
}

// Helper function to retrieve render information
export async function getRenderInfo(renderId: string) {
  // In a real implementation, you would fetch this from your database
  if (typeof global.renderCache === 'undefined') {
    return null;
  }
  
  return global.renderCache[renderId] || null;
}