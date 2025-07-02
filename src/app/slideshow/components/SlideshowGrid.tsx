'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit3, Play, Image as ImageIcon } from 'lucide-react';
import { Slideshow } from '../types';

interface SlideshowGridProps {
  slideshows: Slideshow[];
  onCreateSlideshow: (title: string) => Promise<void>;
  onLoadSlideshow: (slideshowId: string) => Promise<void>;
  onPreviewSlideshow: (slideshow: Slideshow) => void;
  isLoading: boolean;
}

export const SlideshowGrid = ({
  slideshows,
  onCreateSlideshow,
  onLoadSlideshow,
  onPreviewSlideshow,
  isLoading
}: SlideshowGridProps) => {
  const [newSlideshowTitle, setNewSlideshowTitle] = useState('');

  const handleCreateSlideshow = async () => {
    if (!newSlideshowTitle.trim()) return;
    
    await onCreateSlideshow(newSlideshowTitle);
    setNewSlideshowTitle('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Slideshow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Slideshow title..."
              value={newSlideshowTitle}
              onChange={(e) => setNewSlideshowTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateSlideshow()}
            />
            <Button onClick={handleCreateSlideshow} disabled={isLoading}>
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slideshows && slideshows.length > 0 ? slideshows.map((slideshow) => (
          <Card key={slideshow.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{slideshow.title}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {slideshow.slides?.length || 0} slides • Created {new Date(slideshow.createdAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLoadSlideshow(slideshow.id)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPreviewSlideshow(slideshow)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Slideshows Yet</h3>
            <p className="text-gray-600">Create your first slideshow to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}; 