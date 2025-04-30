import { renderMedia } from '@remotion/renderer';
import { VideoConfig } from 'remotion';

export async function renderVideo(
  composition: VideoConfig,
  outputPath: string
) {
  return renderMedia({
    composition,
    outputPath,
    codec: 'h264',
    frameRate: 30,
    width: 1920,
    height: 1080,
    pixelFormat: 'yuv420p',
  });
} 