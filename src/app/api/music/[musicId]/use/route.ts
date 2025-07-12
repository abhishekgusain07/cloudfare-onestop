import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { music } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// PUT /api/music/[musicId]/use - Update last used timestamp
export async function PUT(
  request: NextRequest,
  { params }: { params: { musicId: string } }
) {
  try {
    const { musicId } = params;
    const { userId } = await request.json();

    if (!musicId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing musicId or userId'
        },
        { status: 400 }
      );
    }

    const updatedMusic = await db
      .update(music)
      .set({ lastUsed: new Date() })
      .where(and(eq(music.id, musicId), eq(music.userId, userId)))
      .returning();

    if (updatedMusic.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Music not found or not owned by user'
        },
        { status: 404 }
      );
    }

    console.log(`Updated last used for music ${musicId} by user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Last used updated successfully'
    });

  } catch (error) {
    console.error('Error updating music usage:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update music usage'
      },
      { status: 500 }
    );
  }
}