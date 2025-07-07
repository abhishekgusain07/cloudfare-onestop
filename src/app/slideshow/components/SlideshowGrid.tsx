'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit3, Play, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import { Slideshow } from '../types';
import { SlideshowSkeleton } from './SlideshowSkeleton';

interface SlideshowGridProps {
  slideshows: Slideshow[];
  onCreateSlideshow: (title: string) => Promise<void>;
  onLoadSlideshow: (slideshowId: string) => Promise<void>;
  onPreviewSlideshow: (slideshow: Slideshow) => void;
  onDeleteSlideshow: (slideshow: Slideshow) => void;
  isLoading: boolean;
  isLoadingSlideshows: boolean;
  previewingSlideshow: string | null;
}

export const SlideshowGrid = ({
  slideshows,
  onCreateSlideshow,
  onLoadSlideshow,
  onPreviewSlideshow,
  onDeleteSlideshow,
  isLoading,
  isLoadingSlideshows,
  previewingSlideshow
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
        {isLoadingSlideshows ? (
          // Show skeleton cards while loading
          Array.from({ length: 6 }).map((_, index) => (
            <SlideshowSkeleton key={index} />
          ))
        ) : slideshows && slideshows.length > 0 ? (
          slideshows.map((slideshow) => (
            <Card key={slideshow.id} className="cursor-pointer hover:shadow-lg transition-shadow group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{slideshow.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSlideshow(slideshow);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {slideshow.slideCount ?? slideshow.slides?.length ?? 0} slides • Created {new Date(slideshow.createdAt).toLocaleDateString()}
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
                    disabled={previewingSlideshow === slideshow.id}
                  >
                    {previewingSlideshow === slideshow.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Preview
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
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