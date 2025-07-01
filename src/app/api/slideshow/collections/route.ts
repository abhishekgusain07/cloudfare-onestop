import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { userImageCollections, userImages, insertUserImageCollectionSchema } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

// POST /api/slideshow/collections - Create a new image collection
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
    const { name, description } = data;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Collection name is required" },
        { status: 400 }
      );
    }

    // Validate and create the collection
    const validatedCollection = insertUserImageCollectionSchema.parse({
      id: nanoid(),
      userId: session.user.id,
      name: name.trim(),
      description: description?.trim() || null,
      createdAt: new Date(),
    });

    const [newCollection] = await db.insert(userImageCollections)
      .values(validatedCollection)
      .returning();

    return NextResponse.json({
      success: true,
      collection: newCollection
    });

  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create collection" },
      { status: 500 }
    );
  }
}

// GET /api/slideshow/collections - Get all image collections for the current user
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const includeImages = searchParams.get('includeImages') === 'true';

    if (includeImages) {
      // Get collections with their images
      const collections = await db.select({
        id: userImageCollections.id,
        name: userImageCollections.name,
        description: userImageCollections.description,
        createdAt: userImageCollections.createdAt,
        userId: userImageCollections.userId,
      })
      .from(userImageCollections)
      .where(eq(userImageCollections.userId, session.user.id))
      .orderBy(desc(userImageCollections.createdAt));

      // Get images for each collection
      const collectionsWithImages = await Promise.all(
        collections.map(async (collection) => {
          const images = await db.select()
            .from(userImages)
            .where(eq(userImages.collectionId, collection.id))
            .orderBy(desc(userImages.createdAt));

          return {
            ...collection,
            images
          };
        })
      );

      return NextResponse.json({
        success: true,
        collections: collectionsWithImages
      });
    } else {
      // Get collections without images
      const collections = await db.select()
        .from(userImageCollections)
        .where(eq(userImageCollections.userId, session.user.id))
        .orderBy(desc(userImageCollections.createdAt));

      return NextResponse.json({
        success: true,
        collections
      });
    }

  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch collections" },
      { status: 500 }
    );
  }
} 