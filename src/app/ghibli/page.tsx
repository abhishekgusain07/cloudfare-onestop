'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Loader2Icon, 
  ImageIcon, 
  UploadIcon, 
  SparklesIcon, 
  DownloadIcon,
  XIcon 
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function GhibliTransformPage() {
  // State for managing uploaded and generated images
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Styling and transformation options
  const [ghibliStyle, setGhibliStyle] = useState('classic');
  const [colorPalette, setColorPalette] = useState('pastel');

  // Abort controller for cancelling request
  const abortControllerRef = useRef<AbortController | null>(null);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, or GIF)');
        return;
      }

      if (file.size > maxSize) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Read and set uploaded image
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Generate Ghibli-style image
  const handleGenerateGhibliImage = async () => {
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-ghibli', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageBase64: uploadedImage,
          style: ghibliStyle,
          colorPalette: colorPalette
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Failed to generate Ghibli-style image');
      }

      const data = await response.json();
      
      if (data.image) {
        setGeneratedImage(data.image);
        toast.success('Ghibli-style image generated successfully!');
      } else {
        toast.error('No image was generated');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        toast.info('Ghibli image generation cancelled');
      } else {
        console.error('Ghibli image generation error:', error);
        toast.error('Failed to generate Ghibli-style image. Please try again.');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Cancel generation
  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  // Download generated image
  const handleDownloadImage = async () => {
    if (!generatedImage) {
      toast.error('No image to download');
      return;
    }

    try {
      const response = await fetch(`/api/download-image?url=${encodeURIComponent(generatedImage)}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to download image');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ghibli_style_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Download error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        imageUrl: generatedImage
      });
      
      toast.error('Failed to download image');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <SparklesIcon className="w-6 h-6 text-blue-500" />
            Ghibli Style Transformer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Side: Upload and Customization */}
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <Label className="mb-2">Upload Your Image</Label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                />
                <div 
                  className={`
                    w-full h-64 border-2 border-dashed rounded-lg flex items-center 
                    justify-center cursor-pointer hover:bg-gray-50 transition-colors
                    ${uploadedImage ? 'border-green-500' : 'border-gray-300'}
                  `}
                  onClick={triggerFileInput}
                >
                  {uploadedImage ? (
                    <Image 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      width={250} 
                      height={250} 
                      className="max-h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <UploadIcon className="mx-auto mb-2 h-10 w-10" />
                      <p>Click to upload an image</p>
                      <p className="text-xs">(JPEG, PNG, GIF up to 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customization Options */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2">Ghibli Style</Label>
                  <Select 
                    value={ghibliStyle} 
                    onValueChange={(value) => setGhibliStyle(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Classic Ghibli</SelectItem>
                      <SelectItem value="miyazaki">Miyazaki Inspired</SelectItem>
                      <SelectItem value="modern">Modern Ghibli</SelectItem>
                      <SelectItem value="watercolor">Watercolor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2">Color Palette</Label>
                  <Select 
                    value={colorPalette} 
                    onValueChange={(value) => setColorPalette(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Palette" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pastel">Pastel</SelectItem>
                      <SelectItem value="vibrant">Vibrant</SelectItem>
                      <SelectItem value="muted">Muted</SelectItem>
                      <SelectItem value="vintage">Vintage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Generate Button */}
              <div className="flex space-x-4">
                <Button 
                  onClick={handleGenerateGhibliImage} 
                  disabled={isLoading || !uploadedImage}
                  className="flex-1"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Transforming...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Transform to Ghibli
                    </>
                  )}
                </Button>
                {isLoading && (
                  <Button 
                    variant="destructive"
                    onClick={handleCancelGeneration}
                    size="lg"
                  >
                    <XIcon className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            {/* Right Side: Generated Image */}
            <div className="flex items-center justify-center">
              {!generatedImage ? (
                <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 text-center">
                    Your Ghibli-style image will appear here
                  </p>
                </div>
              ) : (
                <div 
                  className="w-full aspect-square relative group cursor-pointer"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <Image 
                    src={generatedImage} 
                    alt="Ghibli-style Image" 
                    fill 
                    className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-4 left-4 right-4 flex gap-4">
                    <Button 
                      size="lg" 
                      variant="secondary"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadImage();
                      }}
                    >
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-5xl w-full p-0 bg-transparent">
          {generatedImage && (
            <div className="relative w-full h-[80vh]">
              <Image 
                src={generatedImage} 
                alt="Fullscreen Ghibli-style Image" 
                fill 
                className="object-contain"
              />
              <Button 
                variant="secondary" 
                size="lg" 
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                onClick={handleDownloadImage}
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download High-Res Image
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
