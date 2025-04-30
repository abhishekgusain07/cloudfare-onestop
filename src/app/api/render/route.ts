import { NextResponse } from 'next/server';
import { renderMedia } from '@remotion/renderer';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { composition } = await request.json();

    // Create a temporary composition file
    const compositionPath = path.join('/tmp', 'composition.tsx');
    const outputPath = path.join('/tmp', 'output.mp4');

    // Write the composition to a temporary file
    await fs.promises.writeFile(
      compositionPath,
      `import { Composition } from 'remotion';
import { VideoComposition } from '@/components/Preview';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Video"
      component={VideoComposition}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};`
    );

    // Render the video
    await renderMedia({
      composition: {
        id: 'Video',
        durationInFrames: 300,
        fps: 30,
        width: 1920,
        height: 1080,
        defaultProps: {},
      },
      serveUrl: process.env.NEXT_PUBLIC_SERVE_URL || 'http://localhost:3000',
      outputPath,
      codec: 'h264',
      frameRate: 30,
      width: 1920,
      height: 1080,
      pixelFormat: 'yuv420p',
    });

    // Read the rendered video file
    const videoBuffer = await fs.promises.readFile(outputPath);

    // Clean up temporary files
    await fs.promises.unlink(compositionPath);
    await fs.promises.unlink(outputPath);

    // Return the video file
    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="rendered-video.mp4"',
      },
    });
  } catch (error) {
    console.error('Error rendering video:', error);
    return NextResponse.json(
      { error: 'Failed to render video' },
      { status: 500 }
    );
  }
} 