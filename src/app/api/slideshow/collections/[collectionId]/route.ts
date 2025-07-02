import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { userImageCollections, userImages } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// PUT /api/slideshow/collections/[collectionId] - Update a collection
export async function PUT(
  request: NextRequest,
  { params }: { params: { collectionId: string } }
) {
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

    const { collectionId } = params;
    const data = await request.json();
    const { name } = data;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Collection name is required" },
        { status: 400 }
      );
    }

    // Verify the collection belongs to the user
    const [existingCollection] = await db.select()
      .from(userImageCollections)
      .where(and(
        eq(userImageCollections.id, collectionId),
        eq(userImageCollections.userId, session.user.id)
      ));

    if (!existingCollection) {
      return NextResponse.json(
        { success: false, message: "Collection not found" },
        { status: 404 }
      );
    }

    // Update the collection
    const [updatedCollection] = await db.update(userImageCollections)
      .set({
        name: name.trim(),
      })
      .where(eq(userImageCollections.id, collectionId))
      .returning();

    return NextResponse.json({
      success: true,
      collection: updatedCollection
    });

  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update collection" },
      { status: 500 }
    );
  }
}

// DELETE /api/slideshow/collections/[collectionId] - Delete a collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { collectionId: string } }
) {
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

    const { collectionId } = await params;

    // Verify the collection belongs to the user
    const [existingCollection] = await db.select()
      .from(userImageCollections)
      .where(and(
        eq(userImageCollections.id, collectionId),
        eq(userImageCollections.userId, session.user.id)
      ));

    if (!existingCollection) {
      return NextResponse.json(
        { success: false, message: "Collection not found" },
        { status: 404 }
      );
    }

    // Delete the collection (images will be deleted automatically due to cascade)
    await db.delete(userImageCollections)
      .where(eq(userImageCollections.id, collectionId));

    return NextResponse.json({
      success: true,
      message: "Collection deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete collection" },
      { status: 500 }
    );
  }
}

// GET /api/slideshow/collections/[collectionId] - Get a specific collection with its images
export async function GET(
  request: NextRequest,
  { params }: { params: { collectionId: string } }
) {
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

    const { collectionId } = params;

    // Get the collection
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

    // Get all images in this collection
    const images = await db.select()
      .from(userImages)
      .where(eq(userImages.collectionId, collectionId));

    return NextResponse.json({
      success: true,
      collection: {
        ...collection,
        images
      }
    });

  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch collection" },
      { status: 500 }
    );
  }
} 