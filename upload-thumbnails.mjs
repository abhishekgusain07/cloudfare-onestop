import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const LOCAL_THUMBNAILS_PATH = './public/ugc/images';

async function uploadThumbnails() {
  try {
    console.log('🚀 Starting thumbnail upload to R2...');
    
    if (!R2_BUCKET_NAME) {
      throw new Error('R2_BUCKET_NAME environment variable is required');
    }

    // Read all files from the local thumbnails directory
    const files = fs.readdirSync(LOCAL_THUMBNAILS_PATH);
    const pngFiles = files.filter(file => file.toLowerCase().endsWith('.png'));
    
    console.log(`📸 Found ${pngFiles.length} thumbnail files to upload`);
    
    let uploaded = 0;
    let errors = 0;
    
    // Upload each thumbnail
    for (const filename of pngFiles) {
      try {
        const filePath = path.join(LOCAL_THUMBNAILS_PATH, filename);
        const fileContent = fs.readFileSync(filePath);
        
        const uploadParams = {
          Bucket: R2_BUCKET_NAME,
          Key: `images/${filename}`, // Upload to images/ prefix in R2
          Body: fileContent,
          ContentType: 'image/png',
        };
        
        console.log(`⬆️  Uploading ${filename}...`);
        await r2.send(new PutObjectCommand(uploadParams));
        uploaded++;
        console.log(`✅ Successfully uploaded ${filename}`);
        
      } catch (error) {
        console.error(`❌ Failed to upload ${filename}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n🎉 Upload completed!');
    console.log(`✅ Successfully uploaded: ${uploaded} files`);
    console.log(`❌ Failed uploads: ${errors} files`);
    
    if (uploaded > 0) {
      console.log(`\n📍 Thumbnails are now available at:`);
      console.log(`   ${process.env.R2_PUBLIC_URL_BASE}/images/1.png`);
      console.log(`   ${process.env.R2_PUBLIC_URL_BASE}/images/2.png`);
      console.log(`   ... etc`);
    }
    
  } catch (error) {
    console.error('🚨 Error during upload:', error);
    process.exit(1);
  }
}

// Run the upload
uploadThumbnails(); 