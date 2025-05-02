import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { tmpdir } from 'os';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { env } from '@/env';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const userId = session?.session?.userId;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Determine if this is a JSON payload (URL) or form-data (File)
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // Handle URL upload
      const body = await request.json();
      const { url, resourceType = 'auto' } = body;
      
      if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
      }
      
      // Upload to Cloudinary from URL
      const result = await cloudinary.uploader.upload(url, {
        resource_type: resourceType as 'image' | 'video' | 'auto' | 'raw',
        folder: `media-timeline/${userId}`,
      });
      
      return NextResponse.json({ 
        url: result.secure_url,
        public_id: result.public_id,
      });
    } else if (contentType.includes('multipart/form-data')) {
      // Handle File upload via FormData
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const resourceType = (formData.get('resourceType') as string) || 'auto';
      
      if (!file) {
        return NextResponse.json({ error: 'File is required' }, { status: 400 });
      }
      
      // We need to save the file temporarily to disk for cloudinary to upload it
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create a temporary file
      const ext = extname(file.name) || '.tmp';
      const tempPath = join(tmpdir(), `upload-${Date.now()}${ext}`);
      await writeFile(tempPath, buffer);
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(tempPath, {
        resource_type: resourceType as 'image' | 'video' | 'auto' | 'raw',
        folder: `media-timeline/${userId}`,
      });
      
      return NextResponse.json({ 
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
    
    return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ 
      error: `Upload failed: ${error.message || 'Unknown error'}` 
    }, { status: 500 });
  }
}

// Increase limit for large uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}; 