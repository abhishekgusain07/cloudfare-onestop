'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Folder, 
  Image as ImageIcon, 
  Plus, 
  Upload,
  Grid3X3,
  Search
} from 'lucide-react';
import { ImageCollection, UserImage, Slideshow } from '../types';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCollections: ImageCollection[];
  currentSlideshow: Slideshow | null;
  isUploadingImage: boolean;
  onUploadImage: (file: File, collectionId: string) => Promise<any>;
  onAddSlide: (imageUrl: string, text?: string) => Promise<void>;
  onCreateCollection: () => void;
}

type ViewMode = 'collections' | 'images';

export const ImagePickerModal = ({
  isOpen,
  onClose,
  userCollections,
  currentSlideshow,
  isUploadingImage,
  onUploadImage,
  onAddSlide,
  onCreateCollection
}: ImagePickerModalProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('collections');
  const [selectedCollection, setSelectedCollection] = useState<ImageCollection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingImages, setAddingImages] = useState<Set<string>>(new Set());

  const handleCollectionClick = (collection: ImageCollection) => {
    setSelectedCollection(collection);
    setViewMode('images');
  };

  const handleBackToCollections = () => {
    setSelectedCollection(null);
    setViewMode('collections');
    setSearchQuery('');
  };

  const handleAddImage = async (imageUrl: string, imageId: string) => {
    if (!currentSlideshow) return;
    
    setAddingImages(prev => new Set(prev).add(imageId));
    
    try {
      await onAddSlide(imageUrl);
      // Close modal after successfully adding image
      onClose();
    } catch (error) {
      console.error('Failed to add image:', error);
    } finally {
      setAddingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, collectionId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await onUploadImage(file, collectionId);
      // Reset the input value so the same file can be uploaded again
      event.target.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Filter collections based on search query
  const filteredCollections = userCollections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter images based on search query
  const filteredImages = selectedCollection?.images?.filter(image =>
    image.url.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {viewMode === 'images' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToCollections}
                  className="p-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <DialogTitle className="text-xl">
                {viewMode === 'collections' ? 'Choose Images from Your Collections' : selectedCollection?.name}
              </DialogTitle>
            </div>
            
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500">
              {viewMode === 'images' && (
                <span>Collections › {selectedCollection?.name}</span>
              )}
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={viewMode === 'collections' ? 'Search collections...' : 'Search images...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {viewMode === 'collections' ? (
            /* Collections View */
            <div className="h-full overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {/* Create New Collection Card */}
                <Card 
                  className="border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer transition-colors"
                  onClick={onCreateCollection}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 h-32">
                    <Plus className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 text-center">Create New Collection</span>
                  </CardContent>
                </Card>

                {/* Collection Cards */}
                {filteredCollections.map((collection) => (
                  <Card 
                    key={collection.id}
                    className="cursor-pointer hover:shadow-md transition-shadow group"
                    onClick={() => handleCollectionClick(collection)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center">
                        {/* Collection Preview */}
                        <div className="w-full aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                          {collection.images && collection.images.length > 0 ? (
                            <div className="grid grid-cols-2 gap-1 h-full">
                              {collection.images.slice(0, 4).map((image, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={image.url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {collection.images.length > 4 && (
                                <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded">
                                  +{collection.images.length - 4}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Folder className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <h3 className="font-medium text-sm mb-1">{collection.name}</h3>
                        <p className="text-xs text-gray-500">
                          {collection.images?.length || 0} image{(collection.images?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredCollections.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Folder className="w-16 h-16 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No collections found</h3>
                  <p className="text-sm text-center mb-4">
                    {searchQuery ? 'Try a different search term' : 'Create your first collection to get started'}
                  </p>
                  <Button onClick={onCreateCollection}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Collection
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Images View */
            <div className="h-full flex flex-col">
              {/* Collection Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Grid3X3 className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {/* Upload Button */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => selectedCollection && handleFileUpload(e, selectedCollection.id)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploadingImage}
                    id={`upload-modal-${selectedCollection?.id}`}
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={isUploadingImage}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              </div>

              {/* Images Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {filteredImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredImages.map((image) => (
                      <Card key={image.id} className="group overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="relative aspect-square">
                            <img
                              src={image.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Overlay with Add Button */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                              <Button
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleAddImage(image.url, image.id)}
                                disabled={addingImages.has(image.id) || !currentSlideshow}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                {addingImages.has(image.id) ? 'Adding...' : 'Add to Slideshow'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <ImageIcon className="w-16 h-16 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No images found</h3>
                    <p className="text-sm text-center mb-4">
                      {searchQuery ? 'Try a different search term' : 'Upload your first image to this collection'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {currentSlideshow ? (
              `Adding to: ${currentSlideshow.title}`
            ) : (
              'Create a slideshow first'
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 