'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2Icon, SparklesIcon, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

// Prompt enhancement utility
const enhancePrompt = (originalPrompt: string): string => {
  const enhancedPrompts = [
    `High-quality, photorealistic image of ${originalPrompt}`,
    `Cinematic, professional-grade visualization of ${originalPrompt}`,
    `Detailed, vibrant, and stylized representation of ${originalPrompt}`,
  ];

  // Randomly select an enhancement style
  return enhancedPrompts[Math.floor(Math.random() * enhancedPrompts.length)];
};

export default function CreateAvatarPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateAvatar = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for your avatar');
      return;
    }

    setIsLoading(true);
    try {
      // Enhance the prompt
      const enhancedPrompt = enhancePrompt(prompt);

      const response = await fetch('/api/generate-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: enhancedPrompt,
          n: 1,
          size: '1024x1024'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate avatar');
      }

      const data = await response.json();
      
      if (data.image) {
        setGeneratedImage(data.image);
        toast.success('Avatar generated successfully!');
      } else {
        toast.error('No image was generated');
      }
    } catch (error) {
      console.error('Avatar generation error:', error);
      toast.error('Failed to generate avatar. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseForVideo = () => {
    if (!generatedImage) {
      toast.error('Generate an avatar first');
      return;
    }
    // TODO: Implement logic to use generated image in video creation
    toast.info('Image ready to be used in video creation');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <SparklesIcon className="w-6 h-6 text-purple-500" />
            AI Avatar Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Prompt Input Section */}
            <div>
              <Textarea
                placeholder="Describe your ideal avatar (e.g., 'Professional headshot of a tech entrepreneur')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mb-4 min-h-[200px]"
              />
              <Button 
                onClick={handleGenerateAvatar} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Generate Avatar
                  </>
                )}
              </Button>
            </div>

            {/* Image Preview Section */}
            <div className="flex flex-col items-center justify-center">
              {generatedImage ? (
                <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
                  <Image 
                    src={generatedImage} 
                    alt="Generated Avatar" 
                    fill 
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Your avatar will appear here</p>
                </div>
              )}

              {generatedImage && (
                <Button 
                  variant="secondary" 
                  className="mt-4 w-full"
                  onClick={handleUseForVideo}
                >
                  Use in Video Creation
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 