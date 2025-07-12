import { NextRequest, NextResponse } from 'next/server';
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from '@/db/drizzle';
import { music } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// PATCH /api/music/[musicId] - Update music metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ musicId: string }> }
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

    const { musicId } = await params;
    const { duration } = await request.json();

    if (!musicId) {
      return NextResponse.json(
        { success: false, message: "Music ID is required" },
        { status: 400 }
      );
    }

    // Update music record
    const [updatedMusic] = await db
      .update(music)
      .set({ 
        duration: duration || 0,
        lastUsed: new Date() 
      })
      .where(and(
        eq(music.id, musicId),
        eq(music.userId, session.user.id)
      ))
      .returning();

    if (!updatedMusic) {
      return NextResponse.json(
        { success: false, message: "Music not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      music: updatedMusic
    });

  } catch (error) {
    console.error('Error updating music:', error);
    return NextResponse.json(
      { success: false, message: "Failed to update music" },
      { status: 500 }
    );
  }
}

// DELETE /api/music/[musicId] - Delete music track
export async function DELETE(
  request: NextRequest,
  { params }: { params: { musicId: string } }
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

    const { musicId } = params;

    if (!musicId) {
      return NextResponse.json(
        { success: false, message: "Music ID is required" },
        { status: 400 }
      );
    }

    // Delete music record
    const [deletedMusic] = await db
      .delete(music)
      .where(and(
        eq(music.id, musicId),
        eq(music.userId, session.user.id)
      ))
      .returning();

    if (!deletedMusic) {
      return NextResponse.json(
        { success: false, message: "Music not found" },
        { status: 404 }
      );
    }

    console.log(`Deleted music ${musicId} for user ${session.user.id}`);

    // TODO: Optionally delete from R2 storage as well
    // const key = new URL(deletedMusic.url).pathname.substring(1);
    // await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));

    return NextResponse.json({
      success: true,
      message: 'Music deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting music:', error);
    return NextResponse.json(
      { success: false, message: "Failed to delete music" },
      { status: 500 }
    );
  }
}