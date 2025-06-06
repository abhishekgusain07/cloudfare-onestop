import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, n = 1, size = '1024x1024' } = await request.json();

    // Validate input
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' }, 
        { status: 400 }
      );
    }

    // DALL-E 3 only supports generating 1 image at a time
    const imageCount = Math.min(Math.max(n, 1), 1);

    // Generate images sequentially for DALL-E 3
    const images: string[] = [];
    for (let i = 0; i < n; i++) {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: size as '1024x1024' | '512x512' | '256x256',
        quality: 'standard',
        style: 'vivid'
      });

      // Safely extract image URL
      if (response && response.data && response.data.length > 0 && response.data[0].url) {
        images.push(response.data[0].url);
      }
    }

    if (images.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate images' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      images: images,
      prompt: prompt,
      count: images.length
    });

  } catch (error) {
    console.error('Avatar generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate avatar', details: String(error) }, 
      { status: 500 }
    );
  }
}

// Optional: Add GET handler for documentation or testing
export async function GET() {
  return NextResponse.json({
    message: 'OpenAI Avatar Generation Endpoint',
    instructions: 'Send a POST request with a prompt to generate images',
    parameters: {
      prompt: 'Required: Description of the image',
      n: 'Optional: Number of images (max 1 for DALL-E 3)',
      size: 'Optional: Image size (1024x1024, 512x512, 256x256)'
    }
  });
} 