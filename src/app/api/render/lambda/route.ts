import { NextRequest, NextResponse } from 'next/server';
import { renderMediaOnLambda, getRenderProgress } from '@remotion/lambda';

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

    // Validate required environment variables
    if (!process.env.REMOTION_AWS_REGION || !process.env.REMOTION_AWS_FUNCTION_NAME) {
      return NextResponse.json({
        success: false,
        error: 'Missing AWS Lambda configuration. Please set REMOTION_AWS_REGION and REMOTION_AWS_FUNCTION_NAME environment variables.',
      }, { status: 500 });
    }

    // Generate unique render ID
    const renderId = `render_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // AWS Lambda Rendering Implementation
    try {
      console.log('Starting Lambda rendering process for:', renderId);
      
      const renderResponse = await renderMediaOnLambda({
        region: process.env.REMOTION_AWS_REGION as any,
        functionName: process.env.REMOTION_AWS_FUNCTION_NAME,
        composition: 'VideoComposition',
        serveUrl: process.env.REMOTION_SERVE_URL || 'http://localhost:3000',
        inputProps: {
          ...videoParams,
          templateUrl: template.url,
        },
        codec: 'h264',
        imageFormat: 'jpeg',
        maxRetries: 3,
        privacy: 'public',
        logLevel: 'warn',
        outName: `${renderId}.mp4`,
        timeoutInMilliseconds: 300000, // 5 minutes
      });

      // Store render information
      await storeRenderInfo(renderId, {
        status: 'rendering',
        lambdaRenderId: renderResponse.renderId,
        bucketName: renderResponse.bucketName,
        params: videoParams,
        template,
        createdAt: new Date(),
      });

      console.log('Lambda render initiated:', renderResponse);

      return NextResponse.json({
        success: true,
        renderId,
      });
      
    } catch (error) {
      console.error('Lambda rendering error:', error);
      
      // Store failed render info
      await storeRenderInfo(renderId, {
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        params: videoParams,
        template,
        createdAt: new Date(),
        completedAt: new Date(),
      });
      
      return NextResponse.json({
        success: false,
        error: `Lambda rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    const storedRenderInfo = await getRenderInfo(renderId);
    
    if (!storedRenderInfo) {
      return NextResponse.json({ 
        success: false, 
        error: 'Render not found' 
      }, { status: 404 });
    }

    // If it's a Lambda render and still in progress, check Lambda status
    if (storedRenderInfo.status === 'rendering' && storedRenderInfo.lambdaRenderId) {
      try {
        const lambdaProgress = await getRenderProgress({
          renderId: storedRenderInfo.lambdaRenderId,
          bucketName: storedRenderInfo.bucketName,
          functionName: process.env.REMOTION_AWS_FUNCTION_NAME!,
          region: process.env.REMOTION_AWS_REGION as any,
        });

        // Update stored info based on Lambda progress
        const updatedInfo = {
          ...storedRenderInfo,
          progress: Math.round((lambdaProgress.overallProgress || 0) * 100),
        };

        if (lambdaProgress.done) {
          updatedInfo.status = 'completed';
          updatedInfo.completedAt = new Date();
          updatedInfo.downloadUrl = lambdaProgress.outputFile || undefined;
        } else if (lambdaProgress.fatalErrorEncountered) {
          updatedInfo.status = 'failed';
          updatedInfo.error = 'Lambda render failed';
          updatedInfo.completedAt = new Date();
        }

        // Update cache
        await storeRenderInfo(renderId, updatedInfo);

        return NextResponse.json({
          success: true,
          ...updatedInfo,
        });

      } catch (lambdaError) {
        console.error('Error checking Lambda progress:', lambdaError);
        
        // Update to failed status
        const failedInfo = {
          ...storedRenderInfo,
          status: 'failed',
          error: lambdaError instanceof Error ? lambdaError.message : 'Failed to check render progress',
          completedAt: new Date(),
        };
        
        await storeRenderInfo(renderId, failedInfo);
        
        return NextResponse.json({
          success: true,
          ...failedInfo,
        });
      }
    }
    
    // Return stored info for completed/failed renders or local renders
    return NextResponse.json({
      success: true,
      ...storedRenderInfo,
    });
    
  } catch (error) {
    console.error('Error fetching render info:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch render information',
    }, { status: 500 });
  }
}