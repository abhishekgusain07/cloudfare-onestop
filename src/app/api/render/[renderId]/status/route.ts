export async function GET(request: Request, { params }: { params: { renderId: string } }) {
    const renderId = params.renderId;
    
    // Fetch render status from database/cache
    const renderInfo = await getRenderInfo(renderId);
    
    if (renderInfo?.lambdaRenderID) {
      const progress = await getRenderProgress({
        renderId: renderInfo.lambdaRenderID,
        bucketName: renderInfo.bucketName,
        functionName: process.env.REMOTION_AWS_FUNCTION_NAME!,
        region: process.env.REMOTION_AWS_REGION!,
      });
      
      return Response.json({
        status: progress.overallProgress === 1 ? 'completed' : 'rendering',
        progress: Math.round(progress.overallProgress * 100),
        downloadUrl: progress.outputUrl,
      });
    }
    
    return Response.json({ status: 'not_found' });
  }
  