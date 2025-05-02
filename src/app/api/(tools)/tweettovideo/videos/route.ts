import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { videos, videoAssets, videoClips } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    const userId = session?.session?.userId;
    
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
        const body = await request.json();
        const {
            title,
            script,
            audioUrl,
            duration,
            images,
            captions,
            captionPreset,
            captionAlignment,
            screenRatio,
        } = body;

        // Validate required fields
        const missingFields = [];
        if (!title) missingFields.push('title');
        if (!script) missingFields.push('script');
        if (!audioUrl) missingFields.push('audioUrl');
        if (!images || !Array.isArray(images)) missingFields.push('images');
        if (!duration) missingFields.push('duration');
        
        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }
        
        // Create video record
        const [video] = await db.insert(videos).values({
            id: uuidv4(),
            userId,
            title,
            description: script,
            status: 'completed',
            audioDuration: duration || 0,
            screenRatio: screenRatio || '9/16',
            captionPreset: captionPreset || 'BASIC',
            captionAlignment: captionAlignment || 'CENTER',
            disableCaptions: false
        }).returning();

        // Create video assets for images
        const imageAssets = await Promise.all(images.map(async (image: any) => {
            const [asset] = await db.insert(videoAssets).values({
                id: uuidv4(),
                videoId: video.id,
                type: 'image',
                url: image.imageUrl,
                metadata: {
                    contextText: image.contextText
                }
            }).returning();
            return asset;
        }));

        // Create video clips for each image
        await Promise.all(imageAssets.map((asset, index) => {
            return db.insert(videoClips).values({
                id: uuidv4(),
                videoId: video.id,
                assetId: asset.id,
                startTime: 0, // You might want to calculate this based on your logic
                duration: duration || 0,
                trackIndex: index
            });
        }));

        return NextResponse.json({
            success: true,
            videoId: video.id
        });
    } catch (error: any) {
        console.error("Error saving video:", error);
        return NextResponse.json(
            { error: "Failed to save video: " + error.message },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    const userId = session?.session?.userId;
    
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
        // Get query parameters
        const url = new URL(request.url);
        const videoId = url.searchParams.get("id");
        
        if (videoId) {
            // Get a specific video
            const video = await db.select()
                .from(videos)
                .where(and(
                    eq(videos.id, videoId),
                    eq(videos.userId, userId)
                ))
                .leftJoin(videoAssets, eq(videoAssets.videoId, videos.id))
                .leftJoin(videoClips, eq(videoClips.videoId, videos.id));
            
            if (!video || video.length === 0) {
                return NextResponse.json(
                    { error: "Video not found" },
                    { status: 404 }
                );
            }
            
            return NextResponse.json({ video: video[0] });
        } else {
            // Get all videos for the user
            const userVideos = await db.select()
                .from(videos)
                .where(eq(videos.userId, userId))
                .orderBy(desc(videos.createdAt))
                .leftJoin(videoAssets, eq(videoAssets.videoId, videos.id))
                .leftJoin(videoClips, eq(videoClips.videoId, videos.id));
            
            return NextResponse.json({ videos: userVideos });
        }
    } catch (error: any) {
        console.error("Error fetching videos:", error);
        return NextResponse.json(
            { error: "Failed to fetch videos: " + error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    const userId = session?.session?.userId;
    
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
        // Get query parameters
        const url = new URL(request.url);
        const videoId = url.searchParams.get("id");
        
        if (!videoId) {
            return NextResponse.json(
                { error: "Video ID is required" },
                { status: 400 }
            );
        }
        
        // Delete the video and its related records
        const result = await db.delete(videos)
            .where(and(
                eq(videos.id, videoId),
                eq(videos.userId, userId)
            ));
        
        if (result.rowCount === 0) {
            return NextResponse.json(
                { error: "Video not found or you don't have permission to delete it" },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            message: "Video deleted successfully"
        });
    } catch (error: any) {
        console.error("Error deleting video:", error);
        return NextResponse.json(
            { error: "Failed to delete video: " + error.message },
            { status: 500 }
        );
    }
} 