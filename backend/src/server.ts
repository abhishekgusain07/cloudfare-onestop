import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { bundle } from '@remotion/bundler';
import type { WebpackConfiguration } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',  // Next.js frontend
    'http://localhost:3001',  // Backend server
    'http://localhost:3002',  // Potential Remotion webpack server
  ],
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use('/renders', express.static(path.join(__dirname, '../renders')));
app.use(express.static(path.resolve(__dirname, '../../public')));
app.use('/ugc/videos', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(path.resolve(__dirname, '../../public/ugc/videos')));

// Types
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

interface RenderInfo {
  status: 'rendering' | 'completed' | 'failed';
  progress: number;
  params: any;
  template: any;
  createdAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  error?: string;
}

// In-memory cache for render information
const renderCache: Record<string, RenderInfo> = {};

// Helper functions
async function storeRenderInfo(renderId: string, renderInfo: RenderInfo): Promise<RenderInfo> {
  renderCache[renderId] = renderInfo;
  console.log('Storing render info:', { renderId, status: renderInfo.status, progress: renderInfo.progress });
  return renderInfo;
}

function getRenderInfo(renderId: string): RenderInfo | null {
  return renderCache[renderId] || null;
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Video rendering server is running' });
});

// Get available videos endpoint
app.get('/videos', (req: any, res: any) => {
  // Add explicit CORS headers
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  try {
    const videosDir = path.resolve(__dirname, '../../public/ugc/videos');
    
    if (!fs.existsSync(videosDir)) {
      return res.status(404).json({
        success: false,
        error: 'Videos directory not found'
      });
    }

    const files = fs.readdirSync(videosDir);
    const videoFiles = files
      .filter(file => file.toLowerCase().endsWith('.mp4'))
      .map(file => {
        const filePath = path.join(videosDir, file);
        const stats = fs.statSync(filePath);
        
        return {
          id: file.replace('.mp4', ''),
          name: file,
          url: `/ugc/videos/${file}`,
          size: stats.size,
          filename: file
        };
      })
      .sort((a, b) => {
        // Sort numerically if both are numbers, otherwise alphabetically
        const aNum = parseInt(a.id);
        const bNum = parseInt(b.id);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        
        return a.name.localeCompare(b.name);
      });

    res.json({
      success: true,
      videos: videoFiles,
      count: videoFiles.length
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch videos'
    });
  }
});

// Start rendering endpoint
app.post('/render', async (req: any, res: any) => {
  try {
    const { videoParams, template } = req.body as RenderRequest;

    // Validate request
    if (!videoParams || !template) {
      return res.status(400).json({
        success: false,
        error: 'Missing video parameters or template'
      });
    }
    
    // Generate unique render ID
    const renderId = `render_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Make sure the renders directory exists
    const rendersDir = path.resolve(__dirname, '../renders');
    if (!fs.existsSync(rendersDir)) {
      fs.mkdirSync(rendersDir, { recursive: true });
    }

    // Store initial render info
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
        console.log('Starting rendering process for:', renderId);

        // Update progress - Bundle creation
        await storeRenderInfo(renderId, {
          status: 'rendering',
          progress: 10,
          params: videoParams,
          template,
          createdAt: new Date(),
        });

        // Create the bundle - adjust this path to point to your Remotion composition
        const bundleLocation = await bundle(
          path.resolve(__dirname, '../../src/components/remotion/index.ts'),
          undefined,
          {
            webpackOverride: (config) => config,
          }
        );

        console.log('Bundle created at:', bundleLocation);

        // Update progress - Composition selection
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

        // Update progress - Rendering started
        await storeRenderInfo(renderId, {
          status: 'rendering',
          progress: 50,
          params: videoParams,
          template,
          createdAt: new Date(),
        });

        // Inside the rendering process, add more logging
        console.log('Rendering with video parameters:', {
          videoParams,
          templateUrl: template.url,
          fullInputProps: {
            ...videoParams,
            templateUrl: template.url,
          }
        });

        // Set output path
        const outputPath = path.resolve(rendersDir, `${renderId}.mp4`);

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
          progress: 0,
          error: error instanceof Error ? error.message : String(error),
          params: videoParams,
          template,
          createdAt: new Date(),
          completedAt: new Date(),
        });
      }
    })().catch(console.error);

    // Return immediate response while rendering continues in background
    res.json({
      success: true,
      renderId,
      downloadUrl: `/renders/${renderId}.mp4`,
    });

  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during rendering',
    });
  }
});

// Check render status endpoint
app.get('/render/:renderId', (req: any, res: any) => {
  const { renderId } = req.params;

  if (!renderId) {
    return res.status(400).json({
      success: false,
      error: 'Missing renderId parameter'
    });
  }

  try {
    const renderInfo = getRenderInfo(renderId);

    if (!renderInfo) {
      return res.status(404).json({
        success: false,
        error: 'Render not found'
      });
    }

    res.json({
      success: true,
      ...renderInfo,
    });
  } catch (error) {
    console.error('Error fetching render info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch render information',
    });
  }
});

// Get all renders endpoint
app.get('/renders', (req, res) => {
  try {
    const allRenders = Object.entries(renderCache).map(([id, info]) => ({
      id,
      ...info,
    }));

    res.json({
      success: true,
      renders: allRenders,
    });
  } catch (error) {
    console.error('Error fetching all renders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch renders',
    });
  }
});

// Delete render endpoint
app.delete('/render/:renderId', (req: any, res: any) => {
  const { renderId } = req.params;

  try {
    const renderInfo = getRenderInfo(renderId);
    
    if (!renderInfo) {
      return res.status(404).json({
        success: false,
        error: 'Render not found'
      });
    }

    // Delete the video file if it exists
    const filePath = path.resolve(__dirname, '../renders', `${renderId}.mp4`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from cache
    delete renderCache[renderId];

    res.json({
      success: true,
      message: 'Render deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting render:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete render',
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Video rendering server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;