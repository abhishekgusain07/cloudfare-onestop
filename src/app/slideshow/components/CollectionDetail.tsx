'use client';

import { Button } from '@/components/ui/button';
import { Upload, ArrowLeft, ChevronRight, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ImageCollection, Slideshow } from '../types';
// import Image from 'next/image';

interface CollectionDetailProps {
  collection: ImageCollection;
  currentSlideshow: Slideshow | null;
  isUploadingImage: boolean;
  onClose: () => void;
  onUploadImage: (file: File, collectionId: string) => Promise<void>;
  onAddSlide: (imageUrl: string) => Promise<void>;
}

export const CollectionDetail = ({
  collection,
  currentSlideshow,
  isUploadingImage,
  onClose,
  onUploadImage,
  onAddSlide
}: CollectionDetailProps) => {
  return (
    <div className="space-y-4 mt-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm cursor-pointer">
        <button 
          onClick={onClose}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Images
        </button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 font-medium">{collection.name}</span>
      </div>

      {/* Collection Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{collection.name}</h2>
        </div>
        <div className="flex gap-2">
          <input
            id={`upload-${collection.id}`}
            type="file"
            accept="image/*,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              files.forEach(file => onUploadImage(file, collection.id));
              // Reset the input
              e.target.value = '';
            }}
            disabled={isUploadingImage}
          />
          <Button 
            disabled={isUploadingImage}
            onClick={(e) => {
              e.stopPropagation();
              const input = document.getElementById(`upload-${collection.id}`) as HTMLInputElement;
              if (input) input.click();
            }}
          >
            {isUploadingImage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Images
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {collection.images && collection.images.length > 0 ? (
          collection.images.map((image) => (
            <div key={image.id} className="group relative aspect-square">
              <div 
                className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.open(image.url, '_blank')}
                style={{ minHeight: '200px' }}
              >
                <img
                  src={image.url}
                  alt="Collection image"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    console.error('Failed to load image:', image.url);
                    console.error('Error details:', e);
                  }}
                  onLoad={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    console.log('Image loaded successfully:', image.url);
                    const img = e.target as HTMLImageElement;
                    console.log('Image dimensions:', {
                      naturalWidth: img.naturalWidth,
                      naturalHeight: img.naturalHeight,
                      displayWidth: img.width,
                      displayHeight: img.height,
                      complete: img.complete
                    });
                  }}
                />
                <div className="absolute inset-0 bg-transparent group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(image.url, '_blank');
                      }}
                      className="bg-white text-black hover:bg-gray-100"
                    >
                      <ImageIcon className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {/* <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddSlide(image.url);
                      }}
                      className="bg-white text-black hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add to Slideshow
                    </Button> */}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Images Yet</h3>
              <p className="text-gray-600 mb-4">Upload your first images to this collection!</p>
              <div>
                <input
                  id={`upload-empty-${collection.id}`}
                  type="file"
                  accept="image/*,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => onUploadImage(file, collection.id));
                    // Reset the input
                    e.target.value = '';
                  }}
                  disabled={isUploadingImage}
                />
                <Button 
                  disabled={isUploadingImage}
                  onClick={(e) => {
                    e.stopPropagation();
                    const input = document.getElementById(`upload-empty-${collection.id}`) as HTMLInputElement;
                    if (input) input.click();
                  }}
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Images
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 