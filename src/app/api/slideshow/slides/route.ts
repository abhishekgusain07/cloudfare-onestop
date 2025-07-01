import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { slideshows, slides, insertSlideSchema } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

// POST /api/slideshow/slides - Add a new slide to a slideshow
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
    const { slideshowId, imageUrl, text, order } = data;

    // Verify the slideshow belongs to the user
    const [slideshow] = await db.select()
      .from(slideshows)
      .where(and(
        eq(slideshows.id, slideshowId),
        eq(slideshows.userId, session.user.id)
      ));

    if (!slideshow) {
      return NextResponse.json(
        { success: false, message: "Slideshow not found" },
        { status: 404 }
      );
    }

    // If no order specified, get the next order number
    let slideOrder = order;
    if (slideOrder === undefined) {
      const existingSlides = await db.select()
        .from(slides)
        .where(eq(slides.slideshowId, slideshowId));
      slideOrder = existingSlides.length;
    }

    // Validate and create the slide
    const validatedSlide = insertSlideSchema.parse({
      id: nanoid(),
      slideshowId,
      order: slideOrder,
      imageUrl,
      text: text || null,
      createdAt: new Date(),
    });

    const [newSlide] = await db.insert(slides)
      .values(validatedSlide)
      .returning();

    // Update slideshow's updatedAt timestamp
    await db.update(slideshows)
      .set({ updatedAt: new Date() })
      .where(eq(slideshows.id, slideshowId));

    return NextResponse.json({
      success: true,
      slide: newSlide
    });

  } catch (error) {
    console.error("Error creating slide:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create slide" },
      { status: 500 }
    );
  }
}

// PUT /api/slideshow/slides - Update multiple slides (for reordering)
export async function PUT(request: NextRequest) {
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
    const { slideshowId, slides: slidesToUpdate } = data;

    // Verify the slideshow belongs to the user
    const [slideshow] = await db.select()
      .from(slideshows)
      .where(and(
        eq(slideshows.id, slideshowId),
        eq(slideshows.userId, session.user.id)
      ));

    if (!slideshow) {
      return NextResponse.json(
        { success: false, message: "Slideshow not found" },
        { status: 404 }
      );
    }

    // Update each slide in a transaction
    const updatedSlides = [];
    for (const slide of slidesToUpdate) {
      const [updatedSlide] = await db.update(slides)
        .set({
          order: slide.order,
          text: slide.text !== undefined ? slide.text : undefined,
          imageUrl: slide.imageUrl || undefined,
        })
        .where(and(
          eq(slides.id, slide.id),
          eq(slides.slideshowId, slideshowId)
        ))
        .returning();
      
      if (updatedSlide) {
        updatedSlides.push(updatedSlide);
      }
    }

    // Update slideshow's updatedAt timestamp
    await db.update(slideshows)
      .set({ updatedAt: new Date() })
      .where(eq(slideshows.id, slideshowId));

    return NextResponse.json({
      success: true,
      slides: updatedSlides
    });

  } catch (error) {
    console.error("Error updating slides:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update slides" },
      { status: 500 }
    );
  }
} 