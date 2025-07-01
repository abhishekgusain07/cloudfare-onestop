import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { userImageCollections, userImages, insertUserImageSchema } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

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
    const file = formData.get('file') as File;
    const collectionId = formData.get('collectionId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
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

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${nanoid()}.${fileExtension}`;
    
    // For now, we'll use Cloudinary (since it's already set up in the codebase)
    // TODO: Replace with R2 upload once R2 is configured for slideshow images
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert buffer to base64 for Cloudinary upload
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const cloudinary = require('cloudinary').v2;
    
    // Configure Cloudinary (assuming env vars are set)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'slideshow-images',
      public_id: fileName.split('.')[0],
      resource_type: 'image',
    });

    // Save image metadata to database
    const validatedImage = insertUserImageSchema.parse({
      id: nanoid(),
      collectionId,
      userId: session.user.id,
      url: uploadResult.secure_url,
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