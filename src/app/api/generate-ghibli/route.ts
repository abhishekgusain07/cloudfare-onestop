import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting and validation helpers
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Style and palette configurations
const STYLE_PROMPTS = {
  classic: "in the classic Studio Ghibli art style with soft, hand-drawn animation aesthetics, warm lighting, and detailed backgrounds reminiscent of Spirited Away and My Neighbor Totoro",
  miyazaki: "in Hayao Miyazaki's distinctive art style with flowing lines, organic shapes, nature elements, and the characteristic dreamlike quality of his films",
  modern: "in a modern Studio Ghibli style with updated animation techniques while maintaining the studio's signature charm and attention to environmental detail",
  watercolor: "in Studio Ghibli watercolor style with soft, flowing paint techniques, gentle color bleeding, and the ethereal quality of concept art from Ghibli films"
};

const COLOR_PALETTES = {
  pastel: "using soft pastel colors with muted tones, gentle blues, warm pinks, soft greens, and cream whites typical of Ghibli films",
  vibrant: "using vibrant, saturated colors with rich blues, deep greens, warm oranges, and bright yellows while maintaining Ghibli's artistic harmony",
  muted: "using muted, earthy tones with subdued colors, browns, grays, and soft natural hues that create a nostalgic atmosphere",
  vintage: "using vintage color grading with sepia undertones, faded colors, and the warm, nostalgic palette of classic animation"
};

// Helper function to validate base64 image
function validateBase64Image(base64String: string): { isValid: boolean; mimeType?: string; size?: number } {
  try {
    // Check if it's a valid data URL
    const dataUrlMatch = base64String.match(/^data:([^;]+);base64,(.+)$/);
    if (!dataUrlMatch) {
      return { isValid: false };
    }

    const mimeType = dataUrlMatch[1];
    const base64Data = dataUrlMatch[2];

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return { isValid: false };
    }

    // Calculate approximate file size
    const sizeInBytes = (base64Data.length * 3) / 4;
    if (sizeInBytes > MAX_FILE_SIZE) {
      return { isValid: false };
    }

    return { isValid: true, mimeType, size: sizeInBytes };
  } catch (error) {
    return { isValid: false };
  }
}

// Helper function to convert base64 to buffer for OpenAI
function base64ToBuffer(base64String: string): Buffer {
  const base64Data = base64String.split(',')[1];
  return Buffer.from(base64Data, 'base64');
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { imageBase64, style = 'classic', colorPalette = 'pastel' } = body;

    // Validate required fields
    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Missing required field: imageBase64' },
        { status: 400 }
      );
    }

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    // Validate base64 image
    const validation = validateBase64Image(imageBase64);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid image format or size. Please use JPEG, PNG, GIF, or WebP under 5MB.' },
        { status: 400 }
      );
    }

    // Validate style and palette options
    if (!STYLE_PROMPTS[style as keyof typeof STYLE_PROMPTS]) {
      return NextResponse.json(
        { error: 'Invalid style option' },
        { status: 400 }
      );
    }

    if (!COLOR_PALETTES[colorPalette as keyof typeof COLOR_PALETTES]) {
      return NextResponse.json(
        { error: 'Invalid color palette option' },
        { status: 400 }
      );
    }

    // Build the prompt for Ghibli transformation
    const stylePrompt = STYLE_PROMPTS[style as keyof typeof STYLE_PROMPTS];
    const palettePrompt = COLOR_PALETTES[colorPalette as keyof typeof COLOR_PALETTES];
    
    const fullPrompt = `Transform this image ${stylePrompt}, ${palettePrompt}. Maintain the original composition and key elements while applying the Studio Ghibli aesthetic. Focus on creating a magical, whimsical atmosphere with attention to natural lighting and environmental details that are characteristic of Studio Ghibli animations.`;

    console.log('Generating Ghibli-style image with prompt:', fullPrompt.substring(0, 100) + '...');

    // Since GPT-Image-1 doesn't support direct image transformation,
    // we'll use a hybrid approach: analyze the uploaded image with GPT-4V
    // and then generate a new image based on that analysis
    
    // First, analyze the uploaded image to understand its content
    const imageBuffer = base64ToBuffer(imageBase64);
    
    // Convert buffer back to base64 for GPT-4V analysis
    const base64ForAnalysis = imageBuffer.toString('base64');
    const dataUrl = `data:${validation.mimeType};base64,${base64ForAnalysis}`;

    // Analyze the image with GPT-4V to create a detailed description
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image in detail. Describe the main subjects, their poses, the setting, lighting, colors, composition, and any important details. Be specific about facial expressions, clothing, background elements, and the overall mood. This description will be used to recreate the image in Studio Ghibli style."
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const imageDescription = analysisResponse.choices[0]?.message?.content || "";
    
    // Combine the image analysis with Ghibli style instructions
    const enhancedPrompt = `Create an image based on this description: "${imageDescription}". 
    
    Transform this scene ${stylePrompt}, ${palettePrompt}. 
    
    Maintain the original composition, poses, and key elements while applying the Studio Ghibli aesthetic. Focus on creating a magical, whimsical atmosphere with attention to natural lighting and environmental details that are characteristic of Studio Ghibli animations. Ensure the characters and objects maintain their original arrangement and poses but with the distinctive Ghibli art style.`;

    console.log('Generated description:', imageDescription.substring(0, 200) + '...');
    console.log('Generating Ghibli-style image with enhanced prompt...');

    // Now generate the Ghibli-style image based on the analysis
    // GPT-Image-1 has limited parameter support compared to DALL-E
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024"
      // Note: quality and response_format parameters are not supported by gpt-image-1
      // The model defaults to high quality and URL response format
    });

    // Check if image was generated successfully
    if (!response.data || response.data.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      );
    }

    const generatedImageUrl = response.data[0].url;

    // Return the generated image URL
    return NextResponse.json({
      image: generatedImageUrl,
      style,
      colorPalette,
      prompt: fullPrompt
    });

  } catch (error: any) {
    console.error('Ghibli image generation error:', error);

    // Handle specific OpenAI API errors
    if (error?.error?.type) {
      switch (error.error.type) {
        case 'invalid_request_error':
          return NextResponse.json(
            { error: 'Invalid request to image generation service' },
            { status: 400 }
          );
        case 'rate_limit_exceeded':
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429 }
          );
        case 'insufficient_quota':
          return NextResponse.json(
            { error: 'Service quota exceeded' },
            { status: 503 }
          );
        default:
          return NextResponse.json(
            { error: 'Image generation service error' },
            { status: 502 }
          );
      }
    }

    // Handle network or other errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Unable to connect to image generation service' },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating the image' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}