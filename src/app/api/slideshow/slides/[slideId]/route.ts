import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { slideshows, slides } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// PUT /api/slideshow/slides/[slideId] - Update a single slide
export async function PUT(
  request: NextRequest,
  { params }: { params: { slideId: string } }
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

    const { slideId } = params;
    const data = await request.json();

    // Get the slide and verify ownership through slideshow
    const [slide] = await db.select({
      slide: slides,
      slideshow: slideshows,
    })
      .from(slides)
      .innerJoin(slideshows, eq(slides.slideshowId, slideshows.id))
      .where(and(
        eq(slides.id, slideId),
        eq(slideshows.userId, session.user.id)
      ));

    if (!slide) {
      return NextResponse.json(
        { success: false, message: "Slide not found" },
        { status: 404 }
      );
    }

    // Update the slide
    const [updatedSlide] = await db.update(slides)
      .set({
        textElements: data.textElements !== undefined ? data.textElements : slide.slide.textElements,
        imageUrl: data.imageUrl || slide.slide.imageUrl,
        order: data.order !== undefined ? data.order : slide.slide.order,
      })
      .where(eq(slides.id, slideId))
      .returning();

    // Update slideshow's updatedAt timestamp
    await db.update(slideshows)
      .set({ updatedAt: new Date() })
      .where(eq(slideshows.id, slide.slide.slideshowId));

    return NextResponse.json({
      success: true,
      slide: updatedSlide
    });

  } catch (error) {
    console.error("Error updating slide:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update slide" },
      { status: 500 }
    );
  }
}

// DELETE /api/slideshow/slides/[slideId] - Delete a slide
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slideId: string } }
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

    const { slideId } = params;

    // Get the slide and verify ownership through slideshow
    const [slide] = await db.select({
      slide: slides,
      slideshow: slideshows,
    })
      .from(slides)
      .innerJoin(slideshows, eq(slides.slideshowId, slideshows.id))
      .where(and(
        eq(slides.id, slideId),
        eq(slideshows.userId, session.user.id)
      ));

    if (!slide) {
      return NextResponse.json(
        { success: false, message: "Slide not found" },
        { status: 404 }
      );
    }

    // Delete the slide
    await db.delete(slides)
      .where(eq(slides.id, slideId));

    // Update slideshow's updatedAt timestamp
    await db.update(slideshows)
      .set({ updatedAt: new Date() })
      .where(eq(slideshows.id, slide.slide.slideshowId));

    return NextResponse.json({
      success: true,
      message: "Slide deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting slide:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete slide" },
      { status: 500 }
    );
  }
} 