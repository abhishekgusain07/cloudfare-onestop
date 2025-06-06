import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json(
      { error: 'No image URL provided' }, 
      { status: 400 }
    );
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://oaidalleapiprodscus.blob.core.windows.net'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const imageBlob = await response.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    return new NextResponse(Buffer.from(imageBuffer), {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/png',
        'Content-Disposition': 'attachment; filename=avatar.png'
      }
    });

  } catch (error) {
    console.error('Image download proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to download image', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
} 