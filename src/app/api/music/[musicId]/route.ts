import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { music } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// DELETE /api/music/[musicId] - Delete music track
export async function DELETE(
  request: NextRequest,
  { params }: { params: { musicId: string } }
) {
  try {
    const { musicId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!musicId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing musicId or userId'
        },
        { status: 400 }
      );
    }

    const deletedMusic = await db
      .delete(music)
      .where(and(eq(music.id, musicId), eq(music.userId, userId)))
      .returning();

    if (deletedMusic.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Music not found or not owned by user'
        },
        { status: 404 }
      );
    }

    console.log(`Deleted music ${musicId} for user ${userId}`);

    // TODO: Optionally delete from R2 storage as well
    // const key = new URL(deletedMusic[0].url).pathname.substring(1);
    // await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));

    return NextResponse.json({
      success: true,
      message: 'Music deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting music:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete music'
      },
      { status: 500 }
    );
  }
}