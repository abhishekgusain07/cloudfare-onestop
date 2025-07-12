import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { music } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/music - Get user's music library
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing userId parameter'
        },
        { status: 400 }
      );
    }

    const musicLibrary = await db
      .select()
      .from(music)
      .where(eq(music.userId, userId))
      .orderBy(desc(music.uploadedAt));

    return NextResponse.json({
      success: true,
      music: musicLibrary,
      count: musicLibrary.length
    });

  } catch (error) {
    console.error('Error fetching music library:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch music library'
      },
      { status: 500 }
    );
  }
}

// POST /api/music - Save music metadata after successful upload
export async function POST(request: NextRequest) {
  try {
    const { userId, title, filename, url, duration, fileSize, mimeType } = await request.json();

    if (!userId || !title || !filename || !url || !duration || !fileSize || !mimeType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      );
    }

    // Generate unique ID for music record
    const musicId = `music_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const musicRecord = {
      id: musicId,
      userId,
      title,
      filename,
      url,
      duration,
      fileSize,
      mimeType,
      uploadedAt: new Date(),
      lastUsed: null
    };

    const [savedMusic] = await db
      .insert(music)
      .values(musicRecord)
      .returning();

    console.log('Music record saved to database:', savedMusic);

    return NextResponse.json({
      success: true,
      music: savedMusic
    });

  } catch (error) {
    console.error('Error saving music metadata:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save music metadata'
      },
      { status: 500 }
    );
  }
}