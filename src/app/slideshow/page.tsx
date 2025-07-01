"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Upload, 
  Image as ImageIcon, 
  Type, 
  Save, 
  Play,
  Trash2,
  Edit3,
  Download,
  Sparkles,
  Loader2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Slideshow {
  id: string;
  title: string;
  createdAt: string;
  slides: Slide[];
}

interface Slide {
  id: string;
  order: number;
  imageUrl: string;
  text: string;
}

interface UserImage {
  id: string;
  url: string;
  collectionId: string;
}

interface ImageCollection {
  id: string;
  name: string;
  images: UserImage[];
}

// Skeleton component for loading collections
const CollectionSkeleton = () => (
  <Card className="cursor-pointer hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
      <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse mb-3"></div>
      <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
    </CardContent>
  </Card>
);

const SlideshowPage = () => {
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [currentSlideshow, setCurrentSlideshow] = useState<Slideshow | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
  const [userCollections, setUserCollections] = useState<ImageCollection[]>([]);
  const [newSlideshowTitle, setNewSlideshowTitle] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [activeTab, setActiveTab] = useState('my-slideshows');
  const [imagePrompt, setImagePrompt] = useState('');
  const [slideshowPreview, setSlideshowPreview] = useState(false);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);

  // Load user's slideshows
  const loadSlideshows = async () => {
    try {
      const response = await fetch('/api/slideshow');
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        setSlideshows(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to load slideshows:', response.status);
        
        // If unauthorized, redirect to sign-in
        if (response.status === 401) {
          window.location.href = '/sign-in';
          return;
        }
        
        setSlideshows([]);
      }
    } catch (error) {
      console.error('Failed to load slideshows:', error);
      setSlideshows([]);
    }
  };

  // Load user's image collections
  const loadCollections = async () => {
    setIsLoadingCollections(true);
    try {
      const response = await fetch('/api/slideshow/collections?includeImages=true');
      if (response.ok) {
        const data = await response.json();
        // Extract collections from the API response
        const collections = data.success ? data.collections : data;
        setUserCollections(Array.isArray(collections) ? collections : []);
      } else {
        const errorText = await response.text();
        console.error('Failed to load collections:', response.status, errorText);
        
        // If unauthorized, redirect to sign-in
        if (response.status === 401) {
          window.location.href = '/sign-in';
          return;
        }
        
        setUserCollections([]);
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
      setUserCollections([]);
    } finally {
      setIsLoadingCollections(false);
    }
  };

  // Create new slideshow
  const createSlideshow = async () => {
    if (!newSlideshowTitle.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/slideshow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newSlideshowTitle }),
      });
      
      if (response.ok) {
        const newSlideshow = await response.json();
        setSlideshows([...slideshows, newSlideshow]);
        setCurrentSlideshow(newSlideshow);
        setSlides([]);
        setNewSlideshowTitle('');
        setActiveTab('editor');
      }
    } catch (error) {
      console.error('Failed to create slideshow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new collection
  const createCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    setIsCreatingCollection(true);
    try {
      const response = await fetch('/api/slideshow/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newCollectionName,
          description: newCollectionDescription 
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const newCollection = data.success ? data.collection : data;
        setUserCollections([...userCollections, { ...newCollection, images: [] }]);
        setNewCollectionName('');
        setNewCollectionDescription('');
        setIsCreateCollectionModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
    } finally {
      setIsCreatingCollection(false);
    }
  };

  // Upload image to collection
  const uploadImage = async (file: File, collectionId: string) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('collectionId', collectionId);
    
    try {
      const response = await fetch('/api/slideshow/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const newImage = await response.json();
        setUserCollections(collections =>
          collections.map(collection =>
            collection.id === collectionId
              ? { ...collection, images: [...collection.images, newImage] }
              : collection
          )
        );
        return newImage;
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  // Generate AI image
  const generateAIImage = async () => {
    if (!imagePrompt.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/slideshow/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      
      if (response.ok) {
        const generatedImage = await response.json();
        // Add to a default "AI Generated" collection or first collection
        if (userCollections.length > 0) {
          const collection = userCollections[0];
          setUserCollections(collections =>
            collections.map(c =>
              c.id === collection.id
                ? { ...c, images: [...c.images, generatedImage] }
                : c
            )
          );
        }
        setImagePrompt('');
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add slide to current slideshow
  const addSlide = async (imageUrl: string, text: string = '') => {
    if (!currentSlideshow) return;
    
    try {
      const response = await fetch('/api/slideshow/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideshowId: currentSlideshow.id,
          imageUrl,
          text,
          order: slides.length,
        }),
      });
      
      if (response.ok) {
        const newSlide = await response.json();
        setSlides([...slides, newSlide]);
      }
    } catch (error) {
      console.error('Failed to add slide:', error);
    }
  };

  // Update slide text
  const updateSlideText = async (slideId: string, text: string) => {
    try {
      const response = await fetch(`/api/slideshow/slides/${slideId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (response.ok) {
        setSlides(slides.map(slide =>
          slide.id === slideId ? { ...slide, text } : slide
        ));
        if (selectedSlide?.id === slideId) {
          setSelectedSlide({ ...selectedSlide, text });
        }
      }
    } catch (error) {
      console.error('Failed to update slide:', error);
    }
  };

  // Delete slide
  const deleteSlide = async (slideId: string) => {
    try {
      const response = await fetch(`/api/slideshow/slides/${slideId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSlides(slides.filter(slide => slide.id !== slideId));
        if (selectedSlide?.id === slideId) {
          setSelectedSlide(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete slide:', error);
    }
  };

  // Load slideshow with slides
  const loadSlideshow = async (slideshowId: string) => {
    try {
      const response = await fetch(`/api/slideshow/${slideshowId}`);
      if (response.ok) {
        const slideshow = await response.json();
        setCurrentSlideshow(slideshow);
        setSlides(slideshow.slides || []);
        setActiveTab('editor');
      }
    } catch (error) {
      console.error('Failed to load slideshow:', error);
    }
  };

  useEffect(() => {
    loadSlideshows();
    // Load collections with error handling
    loadCollections().catch((error) => {
      console.error('Error in loadCollections useEffect:', error);
      setUserCollections([]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Slideshow Creator</h1>
          <p className="text-gray-600">Create beautiful slideshows with your images and AI-generated content</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="my-slideshows">My Slideshows</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="ai-generate">AI Generate</TabsTrigger>
          </TabsList>

          {/* My Slideshows Tab */}
          <TabsContent value="my-slideshows" className="space-y-4">
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
                    onKeyPress={(e) => e.key === 'Enter' && createSlideshow()}
                  />
                  <Button onClick={createSlideshow} disabled={isLoading}>
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
                         onClick={() => loadSlideshow(slideshow.id)}
                       >
                         <Edit3 className="w-4 h-4 mr-2" />
                         Edit
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => {
                           setCurrentSlideshow(slideshow);
                           setSlideshowPreview(true);
                         }}
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
          </TabsContent>

          {/* Editor Tab */}
          <TabsContent value="editor" className="space-y-4">
            {currentSlideshow ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Slides Panel */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Slides ({slides.length})</span>
                        <Button
                          size="sm"
                          onClick={() => setActiveTab('images')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                                                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                         {slides && slides.length > 0 ? slides.map((slide, index) => (
                           <div
                             key={slide.id}
                             className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                               selectedSlide?.id === slide.id 
                                 ? 'border-blue-500 bg-blue-50' 
                                 : 'border-gray-200 hover:border-gray-300'
                             }`}
                             onClick={() => setSelectedSlide(slide)}
                           >
                             <div className="flex items-center gap-3">
                               <div className="w-12 h-8 bg-gray-200 rounded overflow-hidden">
                                 <img
                                   src={slide.imageUrl}
                                   alt={`Slide ${index + 1}`}
                                   className="w-full h-full object-cover"
                                 />
                               </div>
                               <div className="flex-1 min-w-0">
                                 <p className="text-sm font-medium">Slide {index + 1}</p>
                                 <p className="text-xs text-gray-500 truncate">
                                   {slide.text || 'No text'}
                                 </p>
                               </div>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   deleteSlide(slide.id);
                                 }}
                               >
                                 <Trash2 className="w-4 h-4 text-red-500" />
                               </Button>
                             </div>
                           </div>
                         )) : (
                           <div className="text-center py-8">
                             <p className="text-gray-500">No slides yet. Go to Images tab to add slides!</p>
                           </div>
                         )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedSlide ? (
                        <div className="space-y-4">
                          <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={selectedSlide.imageUrl}
                              alt="Slide preview"
                              className="w-full h-full object-cover"
                            />
                            {selectedSlide.text && (
                              <div className="absolute inset-0 flex items-center justify-center p-4">
                                <div className="bg-black bg-opacity-50 text-white p-3 rounded-lg text-center max-w-full">
                                  <p className="text-sm font-medium break-words">
                                    {selectedSlide.text}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center">
                          <p className="text-gray-500">Select a slide to preview</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Text Editor Panel */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Text Overlay</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedSlide ? (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="slide-text">Text Content</Label>
                            <Textarea
                              id="slide-text"
                              placeholder="Enter text for this slide..."
                              value={selectedSlide.text}
                              onChange={(e) => {
                                const newText = e.target.value;
                                setSelectedSlide({ ...selectedSlide, text: newText });
                              }}
                              onBlur={() => updateSlideText(selectedSlide.id, selectedSlide.text)}
                              rows={4}
                            />
                          </div>
                          <Button
                            onClick={() => updateSlideText(selectedSlide.id, selectedSlide.text)}
                            className="w-full"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Text
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Type className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Select a slide to edit text</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Slideshow Selected</h3>
                  <p className="text-gray-600 mb-4">Create a new slideshow or select an existing one to start editing</p>
                  <Button onClick={() => setActiveTab('my-slideshows')}>
                    View My Slideshows
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-4">
            {/* Collection Management Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Image Collections</h2>
                <p className="text-gray-600 mt-1">Organize your images into collections</p>
              </div>
              <Button onClick={() => setIsCreateCollectionModalOpen(true)}>
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
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
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
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <h3 className="font-medium mb-1">{collection.name}</h3>
                        <p className="text-sm text-gray-500 mb-3">
                          {collection.images?.length || 0} images
                        </p>
                        <div className="flex gap-2">
                          <label className="flex-1 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadImage(file, collection.id);
                              }}
                            />
                            <Button size="sm" variant="outline" className="w-full">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload
                            </Button>
                          </label>
                        </div>
                      </CardContent>
                    </Card>
                  )) : null}

                  {/* Add New Collection Card */}
                  <Card 
                    className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2"
                    onClick={() => setIsCreateCollectionModalOpen(true)}
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
                <Button onClick={() => setIsCreateCollectionModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Collection
                </Button>
              </div>
            )}

            
          </TabsContent>

          {/* AI Generate Tab */}
          <TabsContent value="ai-generate" className="space-y-4">
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
                    onClick={generateAIImage} 
                    disabled={isLoading || !imagePrompt.trim()}
                    className="w-full"
                  >
                    {isLoading ? 'Generating...' : 'Generate Image'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Collection Modal */}
        <Dialog open={isCreateCollectionModalOpen} onOpenChange={setIsCreateCollectionModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Organize your images by creating a new collection.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-5">
              <div className='flex flex-col gap-2'>
                <Label htmlFor="collection-name" className='text-sm font-medium'>Name</Label>
                <Input
                  id="collection-name"
                  placeholder="Collection #1"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  disabled={isCreatingCollection}
                />
              </div>
              
              <div className='flex flex-col gap-2'>
                <Label htmlFor="collection-description" className='text-sm font-medium'>Description (optional)</Label>
                <Textarea
                  id="collection-description"
                  placeholder="Enter collection description"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  disabled={isCreatingCollection}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreateCollectionModalOpen(false);
                  setNewCollectionName('');
                  setNewCollectionDescription('');
                }}
                disabled={isCreatingCollection}
              >
                Cancel
              </Button>
              <Button 
                onClick={createCollection}
                disabled={isCreatingCollection || !newCollectionName.trim()}
                className="min-w-[120px]"
              >
                {isCreatingCollection ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Collection'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SlideshowPage;