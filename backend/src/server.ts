import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { bundle } from '@remotion/bundler';
import type { WebpackConfiguration } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// R2 Client Initialization
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  requestChecksumCalculation: "WHEN_REQUIRED", responseChecksumValidation: "WHEN_REQUIRED",
});

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL_BASE = process.env.R2_PUBLIC_URL_BASE;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',  // Next.js frontend
    process.env.BACKEND_URL || 'http://localhost:3001',  // Backend server
    'http://localhost:3002',  // Potential Remotion webpack server
  ],
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use('/renders', express.static(path.join(__dirname, '../renders')));

// Remove old static routes - no longer serving videos locally
// app.use(express.static(path.resolve(__dirname, '../../public')));
// app.use('/ugc/videos', express.static(path.resolve(__dirname, '../../public/ugc/videos')));

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

// Get available videos endpoint - Updated to fetch from R2
app.get('/videos', async (req: any, res: any) => {
  // Add explicit CORS headers
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  try {
    if (!R2_BUCKET_NAME || !R2_PUBLIC_URL_BASE) {
      return res.status(500).json({ 
        success: false, 
        error: 'R2 bucket configuration missing. Please check your environment variables.' 
      });
    }

    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: 'videos/', // Assuming your videos are in a 'videos/' subfolder
    });
    const command2 = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: 'images/', // Assuming your images are in a 'images/' subfolder
    });

    const data = await r2.send(command);
    const data2 = await r2.send(command2);

    if (!data.Contents) {
      return res.json({ success: true, videos: [], count: 0 });
    }

    // Create a map of available thumbnails for quick lookup
    const thumbnailMap = new Map<string, string>();
    if (data2.Contents) {
      data2.Contents
        .filter(obj => obj.Key && obj.Key.toLowerCase().endsWith('.png'))
        .forEach(obj => {
          const filename = path.basename(obj.Key!);
          const thumbnailId = filename.replace('.png', '');
          thumbnailMap.set(thumbnailId, obj.Key!);
        });
    }

    // Create a map of available preview videos for quick lookup
    const previewMap = new Map<string, string>();
    data.Contents
      .filter(obj => obj.Key && obj.Key.includes('videos/previews/') && obj.Key.toLowerCase().endsWith('.mp4'))
      .forEach(obj => {
        const filename = path.basename(obj.Key!);
        const videoId = filename.replace('.mp4', '');
        previewMap.set(videoId, obj.Key!);
      });
    
    const videoFiles = data.Contents
      .filter(obj => obj.Key && obj.Key.toLowerCase().endsWith('.mp4') && !obj.Key.includes('videos/previews/')) // Only main videos, not previews
      .map(obj => {
        const filename = path.basename(obj.Key!);
        const videoId = filename.replace('.mp4', '');
        
        // Check if corresponding thumbnail exists
        const thumbnailKey = thumbnailMap.get(videoId);
        const thumbnailUrl = thumbnailKey 
          ? `${R2_PUBLIC_URL_BASE}/${thumbnailKey}` 
          : undefined;

        // Check if corresponding preview video exists
        const previewKey = previewMap.get(videoId);
        const previewUrl = previewKey 
          ? `${R2_PUBLIC_URL_BASE}/${previewKey}` 
          : undefined;
        
        return {
          id: videoId,
          name: filename,
          url: `${R2_PUBLIC_URL_BASE}/${obj.Key}`, // Full public R2 URL for original video
          previewUrl: previewUrl, // Full public R2 URL for optimized preview video
          thumbnailUrl: thumbnailUrl, // Full public R2 URL for thumbnail if it exists
          size: obj.Size || 0,
          filename: filename // Convert size to duration in seconds
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

    console.log(`Found ${videoFiles.length} videos in R2 bucket`);
    console.log(videoFiles.slice(0, 2));
    res.json({
      success: true,
      videos: videoFiles,
      count: videoFiles.length
    });
  } catch (error) {
    console.error('Error fetching videos from R2:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch videos from cloud storage'
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
        console.log('Template URL:', template.url);

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
            templateUrl: template.url, // This will now be the R2 URL
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
            templateUrl: template.url, // R2 URL for Remotion rendering
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
  console.log(`R2 Bucket: ${R2_BUCKET_NAME}`);
  console.log(`R2 Public URL: ${R2_PUBLIC_URL_BASE}`);
});

export default app;