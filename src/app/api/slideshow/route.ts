import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { slideshows, slides, insertSlideshowSchema } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { nanoid } from "nanoid";

// POST /api/slideshow - Create a new slideshow
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

    // Parse the request body
    const data = await request.json();

    // Validate the data
    const validatedData = insertSlideshowSchema.parse({
      id: nanoid(),
      userId: session.user.id,
      title: data.title || "Untitled Slideshow",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Insert the new slideshow
    const [newSlideshow] = await db.insert(slideshows)
      .values(validatedData)
      .returning();

    return NextResponse.json({
      success: true,
      slideshow: newSlideshow
    });

  } catch (error) {
    console.error("Error creating slideshow:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create slideshow" },
      { status: 500 }
    );
  }
}

// GET /api/slideshow - Get all slideshows for the current user
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

    // Get all slideshows for the user with slide counts, ordered by most recent first
    const userSlideshows = await db.select({
      id: slideshows.id,
      userId: slideshows.userId,
      title: slideshows.title,
      status: slideshows.status,
      outputFormat: slideshows.outputFormat,
      renderUrl: slideshows.renderUrl,
      createdAt: slideshows.createdAt,
      updatedAt: slideshows.updatedAt,
      slideCount: count(slides.id)
    })
      .from(slideshows)
      .leftJoin(slides, eq(slideshows.id, slides.slideshowId))
      .where(eq(slideshows.userId, session.user.id))
      .groupBy(slideshows.id, slideshows.userId, slideshows.title, slideshows.status, slideshows.outputFormat, slideshows.renderUrl, slideshows.createdAt, slideshows.updatedAt)
      .orderBy(desc(slideshows.updatedAt));

    return NextResponse.json({
      success: true,
      slideshows: userSlideshows
    });

  } catch (error) {
    console.error("Error fetching slideshows:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch slideshows" },
      { status: 500 }
    );
  }
} 