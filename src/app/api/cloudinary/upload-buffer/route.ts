import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

import { writeFile } from 'fs/promises';
import { join } from 'path';
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
    // Get the uploaded file from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }
    
    // Get additional options from FormData
    const options: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'file' && typeof value === 'string') {
        options[key] = value;
      }
    }
    
    // Default folder if not specified
    if (!options.folder) {
      options.folder = `audio-uploads/${userId}`;
    }
    
    // We need to save the file temporarily to disk for cloudinary to upload it
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a temporary file
    const tempPath = join(tmpdir(), `audio-upload-${Date.now()}.mp3`);
    await writeFile(tempPath, buffer);
    
    // Set resource_type to auto or audio
    options.resource_type = options.resource_type || 'auto';
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(tempPath, {
      ...options,
      resource_type: options.resource_type as 'image' | 'video' | 'auto' | 'raw',
    });
    
    return NextResponse.json({
      ...result,
      secure_url: result.secure_url,
      public_id: result.public_id,
      duration: result.duration,
      format: result.format,
      bytes: result.bytes,
      original_filename: result.original_filename,
    });
  } catch (error: any) {
    console.error('Audio buffer upload error:', error);
    return NextResponse.json({ 
      error: `Upload failed: ${error.message || 'Unknown error'}` 
    }, { status: 500 });
  }
}

// Increase limit for audio uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}; 