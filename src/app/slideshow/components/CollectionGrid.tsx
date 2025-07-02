'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Upload, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import { ImageCollection } from '../types';
import { CollectionSkeleton } from './CollectionSkeleton';

interface CollectionGridProps {
  userCollections: ImageCollection[];
  isLoadingCollections: boolean;
  isUploadingImage: boolean;
  onOpenCollection: (collection: ImageCollection) => void;
  onCreateCollection: () => void;
  onDeleteCollection: (collection: ImageCollection) => void;
  onUploadImage: (file: File, collectionId: string) => Promise<void>;
}

export const CollectionGrid = ({
  userCollections,
  isLoadingCollections,
  isUploadingImage,
  onOpenCollection,
  onCreateCollection,
  onDeleteCollection,
  onUploadImage
}: CollectionGridProps) => {
  return (
    <div className="space-y-4">
      {/* Collection Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Image Collections</h2>
          <p className="text-gray-600 mt-1">Organize your images into collections</p>
        </div>
        <Button onClick={onCreateCollection}>
          <Plus className="w-4 h-4 mr-2" />
          New Collection
        </Button>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoadingCollections ? (
          // Show skeleton loading state
          <>
            {/* All Images Skeleton */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-3 animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-1 mx-auto"></div>
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </CardContent>
            </Card>
            
            {/* Collection Skeletons */}
            {[...Array(4)].map((_, index) => (
              <CollectionSkeleton key={index} />
            ))}
          </>
        ) : (
          <>
            {/* All Images Collection */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                // Create a virtual "All Images" collection
                const allImages = userCollections.flatMap(collection => collection.images || []);
                onOpenCollection({
                  id: 'all-images',
                  name: 'All Images',
                  images: allImages
                });
              }}
            >
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-medium mb-1">All Images</h3>
                <p className="text-sm text-gray-500">
                  {userCollections.reduce((total, collection) => total + (collection.images?.length || 0), 0)} images
                </p>
              </CardContent>
            </Card>

            {/* User Collections */}
            {userCollections && userCollections.length > 0 ? userCollections.map((collection) => (
              <Card key={collection.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div 
                    className="flex items-center justify-between mb-3"
                    onClick={() => onOpenCollection(collection)}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCollection(collection);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div onClick={() => onOpenCollection(collection)}>
                    <h3 className="font-medium mb-1">{collection.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {collection.images?.length || 0} images
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        id={`upload-${collection.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onUploadImage(file, collection.id);
                            // Reset the input
                            e.target.value = '';
                          }
                        }}
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          const input = document.getElementById(`upload-${collection.id}`) as HTMLInputElement;
                          if (input) input.click();
                        }}
                        disabled={isUploadingImage}
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : null}

            {/* Add New Collection Card */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2"
              onClick={onCreateCollection}
            >
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-medium mb-1">Create Collection</h3>
                <p className="text-sm text-gray-500">Add a new image collection</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* No Collections State */}
      {!isLoadingCollections && userCollections.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Collections Yet</h3>
          <p className="text-gray-600 mb-4">Create your first collection to organize your images!</p>
          <Button onClick={onCreateCollection}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Collection
          </Button>
        </div>
      )}
    </div>
  );
}; 