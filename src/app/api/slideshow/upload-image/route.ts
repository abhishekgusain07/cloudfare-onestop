import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { userImageCollections, userImages, insertUserImageSchema } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/env";

// POST /api/slideshow/upload-image - Upload an image to user's collection
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
    const file = formData.get('image') as File;
    const collectionId = formData.get('collectionId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No image file provided" },
        { status: 400 }
      );
    }

    if (!collectionId) {
      return NextResponse.json(
        { success: false, message: "Collection ID is required" },
        { status: 400 }
      );
    }

    // Verify the collection belongs to the user
    const [collection] = await db.select()
      .from(userImageCollections)
      .where(and(
        eq(userImageCollections.id, collectionId),
        eq(userImageCollections.userId, session.user.id)
      ));

    if (!collection) {
      return NextResponse.json(
        { success: false, message: "Collection not found" },
        { status: 404 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: "File size too large. Maximum 10MB allowed." },
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
    const fileExtension = file.name.split('.').pop() || 'jpg';
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
    const r2Key = `slideshow-images/${fileName}`;
    const uploadCommand = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: r2Key,
      Body: buffer,
      ContentType: file.type,
      ContentLength: buffer.length,
    });

    await r2.send(uploadCommand);

    // Construct the public URL
    const imageUrl = `${env.R2_PUBLIC_URL_BASE}/${r2Key}`;

    console.log('R2 Upload successful:', {
      fileName,
      r2Key,
      imageUrl,
      fileSize: buffer.length,
      contentType: file.type
    });

    // Save image metadata to database
    const validatedImage = insertUserImageSchema.parse({
      id: nanoid(),
      collectionId,
      userId: session.user.id,
      url: imageUrl,
      createdAt: new Date(),
    });

    const [newImage] = await db.insert(userImages)
      .values(validatedImage)
      .returning();

    return NextResponse.json({
      success: true,
      image: newImage
    });

  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload image" },
      { status: 500 }
    );
  }
} 