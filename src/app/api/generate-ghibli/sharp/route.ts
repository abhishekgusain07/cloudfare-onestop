import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import sharp from 'sharp'; // npm install sharp @types/sharp

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mapping of styles to detailed prompts
const stylePrompts = {
  'classic': 'A Studio Ghibli-style illustration with soft, hand-drawn watercolor-like textures and gentle color palette',
  'miyazaki': 'A Hayao Miyazaki-inspired scene with intricate details, warm lighting, and a sense of magical realism',
  'modern': 'A contemporary Ghibli-inspired image with clean lines, vibrant colors, and a slightly stylized approach',
  'watercolor': 'A delicate watercolor painting reminiscent of Ghibli\'s most ethereal artwork'
};

// Mapping of color palettes
const colorPaletteAdjustments = {
  'pastel': 'using soft, muted pastel colors',
  'vibrant': 'with rich, saturated and energetic colors',
  'muted': 'with subdued, earthy tones',
  'vintage': 'with a nostalgic, slightly faded color scheme'
};

// Helper function to convert any image to PNG format and ensure it's under 4MB
const convertAndOptimizeToPng = async (base64String: string): Promise<File> => {
  try {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    
    // Convert base64 to buffer
    const inputBuffer = Buffer.from(base64Data, 'base64');
    
    // Process image with Sharp
    let processedBuffer = await sharp(inputBuffer)
      .png({ 
        quality: 90,
        compressionLevel: 9 
      })
      .toBuffer();
    
    // Check size and resize if necessary
    let sizeInMB = processedBuffer.length / (1024 * 1024);
    
    if (sizeInMB >= 4) {
      // Resize to reduce file size
      const metadata = await sharp(inputBuffer).metadata();
      const maxDimension = Math.min(1024, Math.max(metadata.width || 1024, metadata.height || 1024));
      
      processedBuffer = await sharp(inputBuffer)
        .resize(maxDimension, maxDimension, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .png({ 
          quality: 80,
          compressionLevel: 9 
        })
        .toBuffer();
      
      sizeInMB = processedBuffer.length / (1024 * 1024);
      
      // If still too large, reduce quality further
      if (sizeInMB >= 4) {
        processedBuffer = await sharp(inputBuffer)
          .resize(800, 800, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .png({ 
            quality: 60,
            compressionLevel: 9 
          })
          .toBuffer();
        
        sizeInMB = processedBuffer.length / (1024 * 1024);
      }
    }
    
    if (sizeInMB >= 4) {
      throw new Error(`Unable to compress image below 4MB. Current size: ${sizeInMB.toFixed(2)}MB`);
    }
    
    return new File([processedBuffer], 'ghibli_image.png', { type: 'image/png' });
    
  } catch (error) {
    throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export async function POST(request: NextRequest) {
  try {
    const { 
      imageBase64, 
      style = 'classic', 
      colorPalette = 'pastel' 
    } = await request.json();

    // Validate input
    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Base64 image is required' }, 
        { status: 400 }
      );
    }

    // Construct detailed prompt
    const stylePrompt = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts['classic'];
    const colorPrompt = colorPaletteAdjustments[colorPalette as keyof typeof colorPaletteAdjustments] || colorPaletteAdjustments['pastel'];
    
    const fullPrompt = `${stylePrompt}, ${colorPrompt}. Inspired by the composition of the uploaded image.`;

    // Convert and optimize image to PNG format
    let imageFile: File;
    
    try {
      imageFile = await convertAndOptimizeToPng(imageBase64);
    } catch (conversionError) {
      return NextResponse.json(
        { 
          error: 'Image processing failed', 
          details: conversionError instanceof Error ? conversionError.message : 'Failed to process image' 
        }, 
        { status: 400 }
      );
    }

    // Generate Ghibli-style image variation
    const response = await openai.images.createVariation({
      image: imageFile,
      n: 1,
      size: '1024x1024'
    });

    // Safely extract image URL
    const generatedImage = response && 
      response.data && 
      response.data.length > 0 && 
      response.data[0].url 
      ? response.data[0].url 
      : null;

    if (!generatedImage) {
      return NextResponse.json(
        { error: 'Failed to generate Ghibli-style image' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      image: generatedImage,
      prompt: fullPrompt,
      style: style,
      colorPalette: colorPalette,
      processedImageSize: `${(imageFile.size / (1024 * 1024)).toFixed(2)}MB`
    });

  } catch (error) {
    console.error('Ghibli image generation error:', error);
    
    // More detailed error handling
    if (error instanceof Error) {
      // Check for specific OpenAI API errors
      if (error.message.includes('Invalid image') || error.message.includes('Uploaded image must be a PNG')) {
        return NextResponse.json(
          { 
            error: 'Invalid image format', 
            details: 'OpenAI image variations API only accepts PNG images under 4MB' 
          }, 
          { status: 400 }
        );
      }
      
      if (error.message.includes('File is too large') || error.message.includes('less than 4 MB')) {
        return NextResponse.json(
          { 
            error: 'Image too large', 
            details: 'Please upload an image that can be compressed to under 4MB' 
          }, 
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to generate Ghibli-style image', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

// Optional: Add GET handler for documentation
export async function GET() {
  return NextResponse.json({
    message: 'Ghibli Style Image Transformation Endpoint',
    instructions: 'Send a POST request with a base64 image (any format) and optional style/color parameters',
    parameters: {
      imageBase64: 'Required: Base64 encoded image (PNG, JPEG, WEBP, etc.)',
      style: 'Optional: Ghibli style (classic, miyazaki, modern, watercolor)',
      colorPalette: 'Optional: Color palette (pastel, vibrant, muted, vintage)'
    },
    features: {
      autoConversion: 'Automatically converts any image format to PNG',
      autoResize: 'Automatically resizes and compresses images to meet 4MB limit',
      supportedInputs: 'PNG, JPEG, WEBP, GIF, and other common formats'
    },
    requirements: {
      outputFormat: 'PNG (OpenAI variations API requirement)',
      maxSize: '4MB (automatically handled)'
    }
  });
}