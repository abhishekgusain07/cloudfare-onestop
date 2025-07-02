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
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slideshowData = await db
      .select()
      .from(slideshows)
      .where(and(eq(slideshows.id, params.id), eq(slideshows.userId, session.user.id)))
      .limit(1);

    if (slideshowData.length === 0) {
      return NextResponse.json({ error: 'Slideshow not found' }, { status: 404 });
    }

    const slideData = await db
      .select()
      .from(slides)
      .where(eq(slides.slideshowId, params.id))
      .orderBy(slides.order);

    return NextResponse.json({
      ...slideshowData[0],
      slides: slideData,
    });
  } catch (error) {
    console.error('Error fetching slideshow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify slideshow ownership
    const existingSlideshow = await db
      .select()
      .from(slideshows)
      .where(and(eq(slideshows.id, params.id), eq(slideshows.userId, session.user.id)))
      .limit(1);

    if (existingSlideshow.length === 0) {
      return NextResponse.json({ error: 'Slideshow not found' }, { status: 404 });
    }

    // Delete associated slides first
    await db.delete(slides).where(eq(slides.slideshowId, params.id));

    // Delete the slideshow
    await db.delete(slideshows).where(eq(slideshows.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting slideshow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slides: slideUpdates, ...slideshowUpdates } = await request.json();

    // Verify slideshow ownership
    const existingSlideshow = await db
      .select()
      .from(slideshows)
      .where(and(eq(slideshows.id, params.id), eq(slideshows.userId, session.user.id)))
      .limit(1);

    if (existingSlideshow.length === 0) {
      return NextResponse.json({ error: 'Slideshow not found' }, { status: 404 });
    }

    // Update slideshow metadata if provided
    if (Object.keys(slideshowUpdates).length > 0) {
      await db
        .update(slideshows)
        .set({
          ...slideshowUpdates,
          updatedAt: new Date(),
        })
        .where(eq(slideshows.id, params.id));
    }

    // Update slides if provided
    if (slideUpdates && Array.isArray(slideUpdates)) {
      // Get existing slides for this slideshow
      const existingSlides = await db
        .select()
        .from(slides)
        .where(eq(slides.slideshowId, params.id));

      const existingSlideIds = new Set(existingSlides.map(slide => slide.id));

      // Process each slide update
      for (const slideUpdate of slideUpdates) {
        if (!slideUpdate.id) continue;

        if (existingSlideIds.has(slideUpdate.id)) {
          // Update existing slide
          await db
            .update(slides)
            .set({
              textElements: slideUpdate.textElements || [],
              order: slideUpdate.order,
              imageUrl: slideUpdate.imageUrl,
            })
            .where(eq(slides.id, slideUpdate.id));
        }
        // Note: We don't create new slides here as they should be created via the dedicated endpoint
      }
    }

    // Return the updated slideshow
    const updatedSlideshow = await db
      .select()
      .from(slideshows)
      .where(eq(slideshows.id, params.id))
      .limit(1);

    const updatedSlides = await db
      .select()
      .from(slides)
      .where(eq(slides.slideshowId, params.id))
      .orderBy(slides.order);

    return NextResponse.json({
      ...updatedSlideshow[0],
      slides: updatedSlides,
    });
  } catch (error) {
    console.error('Error updating slideshow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 