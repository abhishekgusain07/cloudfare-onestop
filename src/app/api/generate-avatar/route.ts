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

    // Limit number of images to prevent excessive generation
    const imageCount = Math.min(Math.max(n, 1), 3);

    // Generate image using OpenAI DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: imageCount,
      size: size as '1024x1024' | '512x512' | '256x256',
      quality: 'standard',
      style: 'vivid'
    });

    // Extract image URLs
    const images = response.data
      .map(img => img.url)
      .filter((url): url is string => url !== undefined);

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
      n: 'Optional: Number of images (1-3)',
      size: 'Optional: Image size (1024x1024, 512x512, 256x256)'
    }
  });
} 