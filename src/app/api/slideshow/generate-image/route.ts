import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { userImageCollections, userImages, insertUserImageSchema } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import OpenAI from "openai";

// Initialize OpenAI (assuming OPENAI_API_KEY is in env)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/slideshow/generate-image - Generate an image using AI
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

    const data = await request.json();
    const { productDescription, imageStyle, collectionId } = data;

    if (!productDescription || productDescription.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Product description is required" },
        { status: 400 }
      );
    }

    if (!imageStyle || imageStyle.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Image style is required" },
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

    // Create the AI prompt
    const prompt = `Create a ${imageStyle} style image for: ${productDescription}. The image should be high quality, professional, and suitable for marketing materials. Style: ${imageStyle}`;

    try {
      // Generate image using DALL-E 3
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      const imageUrl = response.data?.[0]?.url;
      
      if (!imageUrl) {
        throw new Error("No image URL returned from OpenAI");
      }

      // Download the image and upload to Cloudinary for permanent storage
      const imageResponse = await fetch(imageUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const dataURI = `data:image/png;base64,${base64}`;

      // Upload to Cloudinary
      const cloudinary = require('cloudinary').v2;
      
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const fileName = `ai-generated-${nanoid()}`;
      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: 'slideshow-images/ai-generated',
        public_id: fileName,
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
        image: newImage,
        prompt: prompt
      });

    } catch (aiError) {
      console.error("AI image generation error:", aiError);
      return NextResponse.json(
        { success: false, message: "Failed to generate image with AI" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error in generate-image endpoint:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate image" },
      { status: 500 }
    );
  }
} 