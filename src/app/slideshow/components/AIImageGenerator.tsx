'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface AIImageGeneratorProps {
  onGenerateImage: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export const AIImageGenerator = ({
  onGenerateImage,
  isLoading
}: AIImageGeneratorProps) => {
  const [imagePrompt, setImagePrompt] = useState('');

  const handleGenerate = async () => {
    if (!imagePrompt.trim()) return;
    
    await onGenerateImage(imagePrompt);
    setImagePrompt('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2" />
          AI Image Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="image-prompt">Describe the image you want</Label>
            <Textarea
              id="image-prompt"
              placeholder="A beautiful sunset over mountains..."
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              rows={3}
            />
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !imagePrompt.trim()}
            className="w-full"
          >
            {isLoading ? 'Generating...' : 'Generate Image'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 