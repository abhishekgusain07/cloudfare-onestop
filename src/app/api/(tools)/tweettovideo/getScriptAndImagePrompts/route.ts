import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// Rate limiter implementation
class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number; // tokens per ms
  private lastRefillTimestamp: number;

  constructor(maxRequestsPerMinute: number) {
    this.maxTokens = maxRequestsPerMinute;
    this.tokens = maxRequestsPerMinute;
    this.refillRate = maxRequestsPerMinute / (60 * 1000); // Convert to tokens per ms
    this.lastRefillTimestamp = Date.now();
  }

  async getToken(): Promise<boolean> {
    this.refill();
    
    if (this.tokens < 1) {
      const waitTime = Math.ceil((1 - this.tokens) / this.refillRate);
      console.log(`Rate limit reached. Waiting ${waitTime}ms for next token`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.refill();
    }
    
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    
    return false;
  }

  private refill() {
    const now = Date.now();
    const elapsedTime = now - this.lastRefillTimestamp;
    const tokensToAdd = elapsedTime * this.refillRate;
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefillTimestamp = now;
    }
  }
}

// Create a singleton rate limiter instance (10 requests per minute)
const geminiRateLimiter = new RateLimiter(10);

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    const userId = session?.session?.userId;
    if(!userId){
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();
        const { script } = body;
        
        // Validate input
        if (!script || typeof script !== 'string' || script.trim() === '') {
            return NextResponse.json(
                { error: "Script is required and must be a non-empty string" },
                { status: 400 }
            );
        }
        
        const prompt = `You are a video script and image prompt generator. Your task is to:
        1. Take the provided script and break it into logical segments
        2. For each segment, generate:
           - ContextText: The exact text that will be spoken
           - ImagePrompt: A detailed prompt for generating an image that matches the text
        3. Return the response in this exact JSON format:
           {
             "result": [
               {
                 "ContextText": "exact text from script",
                 "ImagePrompt": "detailed image generation prompt"
               }
             ]
           }
        4. Do not add any additional text or explanation
        5. Use only the words from the provided script
        6. Keep the original sentence structure
        
        Script to process: ${script}`;

        // Wait for a rate limit token before making the API call
        await geminiRateLimiter.getToken();

        // Use Vercel AI SDK to generate text with Gemini
        const { text: generatedText } = await generateText({
            model: google('gemini-1.5-flash'),
            prompt: prompt,
            maxTokens: 1000,
            temperature: 0.1,
        });
        
        if (!generatedText) {
            return NextResponse.json(
                { error: "Failed to generate script segments and image prompts" },
                { status: 500 }
            );
        }

        // Clean the response to ensure it's valid JSON
        const cleanedText = generatedText
            .replace(/```json\n?/g, '')  // Remove JSON code blocks
            .replace(/```\n?/g, '')      // Remove any remaining code blocks
            .trim();                     // Remove whitespace

        let data;
        try {
            data = JSON.parse(cleanedText);
            
            // Validate the data structure
            if (!data.result || !Array.isArray(data.result)) {
                throw new Error("Invalid response structure");
            }
            
            // Validate each segment
            data.result.forEach((segment: { ContextText: string; ImagePrompt: string }, index: number) => {
                if (!segment.ContextText || !segment.ImagePrompt) {
                    throw new Error(`Invalid segment at index ${index}`);
                }
            });
            
        } catch (error: unknown) {
            console.error("Error parsing Gemini response:", error);
            console.error("Raw response:", cleanedText);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return NextResponse.json(
                { error: "Failed to parse AI response: " + errorMessage },
                { status: 500 }
            );
        }

        console.log("getScriptAndImagePrompts: ", data);
        
        // Log for debugging purposes only in development
        if (process.env.NODE_ENV === 'development') {
            console.log(data);
        }
        
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error processing script for image prompts:", error);
        
        // Handle JSON parse errors separately
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: "Failed to parse AI response" },
                { status: 500 }
            );
        }
        
        // Handle Gemini API errors
        if (error.name === 'GoogleAIError') {
            return NextResponse.json(
                { error: "AI service error: " + error.message },
                { status: 503 }
            );
        }
        
        return NextResponse.json(
            { error: "An unexpected error occurred: " + error.message },
            { status: 500 }
        );
    }
} 