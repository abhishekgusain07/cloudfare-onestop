// src/remotion/index.ts - Remotion entry point

import { Composition } from 'remotion';
import { VideoComposition } from '../components/VideoComposition';
import { VideoParams } from '../pages/create';

// This file is the entry point for Remotion rendering
// It registers your compositions that can be rendered

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main video composition */}
      <Composition
        id="VideoComposition"
        component={VideoComposition}
        durationInFrames={450} // 15 seconds at 30fps (will be dynamic based on template)
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          selectedTemplate: 'template1',
          text: 'Your text here...',
          textPosition: 'center' as const,
          textAlign: 'center' as const,
          fontSize: 48,
          textColor: '#ffffff',
          musicVolume: 0.5,
          templateUrl: '/videos/urban-lifestyle.mp4',
        } as VideoParams & { templateUrl: string }}
      />

      {/* You can add more compositions for different aspect ratios */}
      <Composition
        id="VideoCompositionSquare"
        component={VideoComposition}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          selectedTemplate: 'template1',
          text: 'Your text here...',
          textPosition: 'center' as const,
          textAlign: 'center' as const,
          fontSize: 48,
          textColor: '#ffffff',
          musicVolume: 0.5,
          templateUrl: '/videos/urban-lifestyle.mp4',
        } as VideoParams & { templateUrl: string }}
      />

      {/* Vertical/Story format */}
      <Composition
        id="VideoCompositionVertical"
        component={VideoComposition}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          selectedTemplate: 'template1',
          text: 'Your text here...',
          textPosition: 'center' as const,
          textAlign: 'center' as const,
          fontSize: 48,
          textColor: '#ffffff',
          musicVolume: 0.5,
          templateUrl: '/videos/urban-lifestyle.mp4',
        } as VideoParams & { templateUrl: string }}
      />
    </>
  );
};

// Export for Remotion CLI/bundler
export default RemotionRoot;