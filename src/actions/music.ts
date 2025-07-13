"use server";

import { db } from "@/db/drizzle";
import { music } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

export interface MusicTrack {
  id: string;
  userId: string;
  title: string;
  filename: string;
  url: string;
  duration: number;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  lastUsed?: string;
}

export async function getUserMusic(): Promise<{
  success: boolean;
  music?: MusicTrack[];
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }

    const musicLibrary = await db
      .select()
      .from(music)
      .where(eq(music.userId, session.user.id))
      .orderBy(desc(music.uploadedAt));

    return {
      success: true,
      music: musicLibrary.map(track => ({
        ...track,
        uploadedAt: track.uploadedAt.toISOString(),
        lastUsed: track.lastUsed?.toISOString()
      }))
    };

  } catch (error) {
    console.error('Error fetching user music:', error);
    return {
      success: false,
      error: 'Failed to fetch music library'
    };
  }
}

const updateMusicSchema = z.object({
  musicId: z.string(),
  duration: z.number().optional(),
  lastUsed: z.boolean().optional(),
});

const updateMusicTitleSchema = z.object({
  musicId: z.string(),
  title: z.string().min(1, "Title cannot be empty").max(255, "Title too long"),
});

export async function updateMusicUsage(input: {
  musicId: string;
  duration?: number;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }

    const validatedInput = updateMusicSchema.parse({
      ...input,
      lastUsed: true
    });

    await db
      .update(music)
      .set({
        ...(validatedInput.duration && { duration: validatedInput.duration }),
        lastUsed: new Date(),
      })
      .where(eq(music.id, validatedInput.musicId));

    return { success: true };

  } catch (error) {
    console.error('Error updating music usage:', error);
    return {
      success: false,
      error: 'Failed to update music usage'
    };
  }
}

export async function updateMusicTitle(input: {
  musicId: string;
  title: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }

    const validatedInput = updateMusicTitleSchema.parse(input);

    // Verify the music belongs to the current user
    const existingMusic = await db
      .select()
      .from(music)
      .where(eq(music.id, validatedInput.musicId))
      .limit(1);

    if (existingMusic.length === 0) {
      return {
        success: false,
        error: "Music track not found"
      };
    }

    if (existingMusic[0].userId !== session.user.id) {
      return {
        success: false,
        error: "Unauthorized to edit this music"
      };
    }

    await db
      .update(music)
      .set({
        title: validatedInput.title,
      })
      .where(eq(music.id, validatedInput.musicId));

    return { success: true };

  } catch (error) {
    console.error('Error updating music title:', error);
    return {
      success: false,
      error: error instanceof z.ZodError ? error.errors[0].message : 'Failed to update music title'
    };
  }
}

export async function deleteUserMusic(musicId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }

    await db
      .delete(music)
      .where(eq(music.id, musicId));

    return { success: true };

  } catch (error) {
    console.error('Error deleting music:', error);
    return {
      success: false,
      error: 'Failed to delete music'
    };
  }
}