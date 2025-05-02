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
        
        const prompt = `  
        1. The output response should be exactly what I want in the json format.
        2. Not a single word should be out of context.
        3. The output should be an array of objects.
        4. Each object should have 2 keys, ContextText and ImagePrompt.
        5. ContextText is the part that the narrator will say and ImagePrompt is the prompt to generate the image what will be rendered for the time narrator will say that.
        6. The output should be an array of objects. 
        7. The array should be named as "result". 
        8. Please don't add any other thing to the script and the ContextText outside of the words used in the script. 
        9. Sentence structure should be same as the script.
        
        The script is: ${script}`;

        // Wait for a rate limit token before making the API call
        await geminiRateLimiter.getToken();

        // Use Vercel AI SDK to generate text with Gemini
        const { text: generatedText } = await generateText({
            model: google('gemini-2.0-flash'),
            prompt: prompt,
            maxTokens: 1000, // Adjust based on your needs
            temperature: 0.1, // Lower temperature for more deterministic results
        });
        
        if (!generatedText) {
            return NextResponse.json(
                { error: "Failed to generate script segments and image prompts" },
                { status: 500 }
            );
        }
        
        let data;
        try {
            data = JSON.parse(generatedText);
        } catch (error) {
            console.error("Error parsing Gemini response:", error);
            return NextResponse.json(
                { error: "Failed to parse AI response" },
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