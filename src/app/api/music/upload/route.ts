import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { music, insertMusicSchema } from "@/db/schema";
import { nanoid } from "nanoid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/env";

// POST /api/music/upload - Upload music file
export async function POST(request: NextRequest) {
  try {
    // Get the current user's session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('music') as File;
    const title = formData.get('title') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No music file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Only MP3, WAV, M4A, AAC, and OGG are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: "File size too large. Maximum 50MB allowed." },
        { status: 400 }
      );
    }

    // Check R2 configuration
    if (!env.R2_BUCKET_NAME || !env.R2_ENDPOINT || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_PUBLIC_URL_BASE) {
      console.error('Missing R2 configuration:', {
        hasBucket: !!env.R2_BUCKET_NAME,
        hasEndpoint: !!env.R2_ENDPOINT,
        hasAccessKey: !!env.R2_ACCESS_KEY_ID,
        hasSecretKey: !!env.R2_SECRET_ACCESS_KEY,
        hasPublicUrl: !!env.R2_PUBLIC_URL_BASE
      });
      return NextResponse.json(
        { success: false, message: "R2 storage configuration is incomplete. Please check your environment variables." },
        { status: 500 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'mp3';
    const fileName = `${nanoid()}.${fileExtension}`;
    
    // Initialize R2 client
    const r2 = new S3Client({
      region: 'auto',
      endpoint: env.R2_ENDPOINT,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
      requestChecksumCalculation: "WHEN_REQUIRED", 
      responseChecksumValidation: "WHEN_REQUIRED",
    });

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const r2Key = `music/${fileName}`;
    const uploadCommand = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: r2Key,
      Body: buffer,
      ContentType: file.type,
      ContentLength: buffer.length,
    });

    await r2.send(uploadCommand);

    // Construct the public URL
    const musicUrl = `${env.R2_PUBLIC_URL_BASE}/${r2Key}`;

    console.log('R2 Music Upload successful:', {
      fileName,
      r2Key,
      musicUrl,
      fileSize: buffer.length,
      contentType: file.type
    });

    // Duration will be determined on the client side
    const duration = 0; // Default, will be updated by client if needed

    // Save music metadata to database
    const validatedMusic = insertMusicSchema.parse({
      id: nanoid(),
      userId: session.user.id,
      title: title || file.name.replace(/\.[^/.]+$/, ""), // Remove extension if no title provided
      filename: file.name,
      url: musicUrl,
      duration,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date(),
    });

    const [newMusic] = await db.insert(music)
      .values(validatedMusic)
      .returning();

    return NextResponse.json({
      success: true,
      music: newMusic
    });

  } catch (error) {
    console.error("Error uploading music:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload music" },
      { status: 500 }
    );
  }
}