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

    // Generate image using OpenAI DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: n,
      size: size as '1024x1024' | '512x512' | '256x256',
      quality: 'standard',
      style: 'vivid'
    });

    // Extract image URL
    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to generate image' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      image: imageUrl,
      prompt: prompt 
    });

  } catch (error) {
    console.error('Avatar generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate avatar' }, 
      { status: 500 }
    );
  }
}

// Optional: Add GET handler for documentation or testing
export async function GET() {
  return NextResponse.json({
    message: 'OpenAI Avatar Generation Endpoint',
    instructions: 'Send a POST request with a prompt to generate an image'
  });
} 