import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { slideshows, slides } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

// GET /api/slideshow/[id] - Get a specific slideshow with its slides
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;

    // Get the slideshow
    const [slideshow] = await db.select()
      .from(slideshows)
      .where(and(
        eq(slideshows.id, id),
        eq(slideshows.userId, session.user.id)
      ));

    if (!slideshow) {
      return NextResponse.json(
        { success: false, message: "Slideshow not found" },
        { status: 404 }
      );
    }

    // Get all slides for this slideshow, ordered by their order field
    const slideshowSlides = await db.select()
      .from(slides)
      .where(eq(slides.slideshowId, id))
      .orderBy(asc(slides.order));

    return NextResponse.json({
      success: true,
      slideshow: {
        ...slideshow,
        slides: slideshowSlides
      }
    });

  } catch (error) {
    console.error("Error fetching slideshow:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch slideshow" },
      { status: 500 }
    );
  }
}

// PUT /api/slideshow/[id] - Update a slideshow
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;
    const data = await request.json();

    // Verify the slideshow belongs to the user
    const [existingSlideshow] = await db.select()
      .from(slideshows)
      .where(and(
        eq(slideshows.id, id),
        eq(slideshows.userId, session.user.id)
      ));

    if (!existingSlideshow) {
      return NextResponse.json(
        { success: false, message: "Slideshow not found" },
        { status: 404 }
      );
    }

    // Update the slideshow
    const [updatedSlideshow] = await db.update(slideshows)
      .set({
        title: data.title || existingSlideshow.title,
        updatedAt: new Date(),
      })
      .where(eq(slideshows.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      slideshow: updatedSlideshow
    });

  } catch (error) {
    console.error("Error updating slideshow:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update slideshow" },
      { status: 500 }
    );
  }
}

// DELETE /api/slideshow/[id] - Delete a slideshow
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;

    // Verify the slideshow belongs to the user
    const [existingSlideshow] = await db.select()
      .from(slideshows)
      .where(and(
        eq(slideshows.id, id),
        eq(slideshows.userId, session.user.id)
      ));

    if (!existingSlideshow) {
      return NextResponse.json(
        { success: false, message: "Slideshow not found" },
        { status: 404 }
      );
    }

    // Delete the slideshow (slides will be deleted automatically due to cascade)
    await db.delete(slideshows)
      .where(eq(slideshows.id, id));

    return NextResponse.json({
      success: true,
      message: "Slideshow deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting slideshow:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete slideshow" },
      { status: 500 }
    );
  }
} 