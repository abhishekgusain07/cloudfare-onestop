'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Loader2Icon, 
  SparklesIcon, 
  ImageIcon, 
  DownloadIcon, 
  VideoIcon 
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Prompt enhancement utility
const enhancePrompt = (originalPrompt: string, style?: string): string => {
  const styleMap = {
    'photorealistic': `High-quality, photorealistic image of ${originalPrompt}`,
    'cinematic': `Cinematic, professional-grade visualization of ${originalPrompt}`,
    'artistic': `Detailed, vibrant, and stylized artistic representation of ${originalPrompt}`,
    'minimalist': `Clean, minimalist, modern interpretation of ${originalPrompt}`,
    'vintage': `Nostalgic, vintage-style illustration of ${originalPrompt}`
  };

  return styleMap[style as keyof typeof styleMap] || 
         `High-quality, photorealistic image of ${originalPrompt}`;
};

export default function CreateAvatarPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Customization states
  const [imageCount, setImageCount] = useState(1);
  const [imageStyle, setImageStyle] = useState('photorealistic');
  const [imageSize, setImageSize] = useState<'1024x1024' | '512x512' | '256x256'>('1024x1024');

  const handleGenerateAvatar = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for your avatar');
      return;
    }

    setIsLoading(true);
    try {
      // Enhance the prompt with selected style
      const enhancedPrompt = enhancePrompt(prompt, imageStyle);

      const response = await fetch('/api/generate-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: enhancedPrompt,
          n: imageCount,
          size: imageSize
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate avatar');
      }

      const data = await response.json();
      
      if (data.images && data.images.length > 0) {
        setGeneratedImages(data.images);
        toast.success(`${data.images.length} Avatar(s) generated successfully!`);
      } else {
        toast.error('No images were generated');
      }
    } catch (error) {
      console.error('Avatar generation error:', error);
      toast.error('Failed to generate avatar. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `avatar_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    }
  };

  const handleUseForVideo = (imageUrl: string) => {
    if (!imageUrl) {
      toast.error('Select an image first');
      return;
    }
    // TODO: Implement logic to use generated image in video creation
    toast.info('Image ready to be used in video creation');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <SparklesIcon className="w-6 h-6 text-purple-500" />
            AI Avatar Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Side: Customization and Prompt */}
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2">Image Style</Label>
                  <Select 
                    value={imageStyle} 
                    onValueChange={(value) => setImageStyle(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photorealistic">Photorealistic</SelectItem>
                      <SelectItem value="cinematic">Cinematic</SelectItem>
                      <SelectItem value="artistic">Artistic</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="vintage">Vintage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="mb-2">Number of Images</Label>
                  <Select 
                    value={imageCount.toString()} 
                    onValueChange={(value) => setImageCount(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Count" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3].map(count => (
                        <SelectItem key={count} value={count.toString()}>
                          {count} Image{count > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="mb-2">Image Size</Label>
                <Select 
                  value={imageSize} 
                  onValueChange={(value: '1024x1024' | '512x512' | '256x256') => setImageSize(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1024x1024">Large (1024x1024)</SelectItem>
                    <SelectItem value="512x512">Medium (512x512)</SelectItem>
                    <SelectItem value="256x256">Small (256x256)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2">Prompt Description</Label>
                <Textarea
                  placeholder="Describe your ideal avatar (e.g., 'Professional headshot of a tech entrepreneur')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
              
              <Button 
                onClick={handleGenerateAvatar} 
                disabled={isLoading}
                className="w-full"
                size="lg"
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

            {/* Right Side: Image Gallery */}
            <div>
              {generatedImages.length === 0 ? (
                <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 text-center">
                    Your generated avatars will appear here
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {generatedImages.map((imageUrl, index) => (
                    <div 
                      key={imageUrl} 
                      className="relative group"
                    >
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
                        <Image 
                          src={imageUrl} 
                          alt={`Generated Avatar ${index + 1}`} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          className="flex-1"
                          onClick={() => handleDownloadImage(imageUrl)}
                        >
                          <DownloadIcon className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleUseForVideo(imageUrl)}
                        >
                          <VideoIcon className="mr-2 h-4 w-4" />
                          Use in Video
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 