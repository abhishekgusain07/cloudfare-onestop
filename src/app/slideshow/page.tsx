"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Slideshow, 
  Slide, 
  TextElement,
  ImageCollection,
  UserImage 
} from './types';
import { migrateSlidesToNewFormat, createDefaultTextElement } from './utils/dataCompatibility';
import {
  SlideshowGrid,
  CollectionGrid,
  CollectionDetail,
  SlideshowEditor,
  SlideshowEditorLayout,
  SlideStrip,
  EditingCanvas,
  StylingToolbar,
  AIImageGenerator,
  CreateCollectionModal,
  DeleteCollectionModal,
  ImagePickerModal
} from './components';

const SlideshowPage = () => {
  // State management
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [currentSlideshow, setCurrentSlideshow] = useState<Slideshow | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
  const [userCollections, setUserCollections] = useState<ImageCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [activeTab, setActiveTab] = useState('my-slideshows');
  const [slideshowPreview, setSlideshowPreview] = useState(false);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [openedCollection, setOpenedCollection] = useState<ImageCollection | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<ImageCollection | null>(null);
  const [isDeletingCollection, setIsDeletingCollection] = useState(false);
  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] = useState(false);
  const [isImagePickerModalOpen, setIsImagePickerModalOpen] = useState(false);
  
  // Phase 1 Editor State
  const [selectedTextElement, setSelectedTextElement] = useState<TextElement | null>(null);

  // API Functions
  const loadSlideshows = async () => {
    try {
      const response = await fetch('/api/slideshow');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.slideshows) {
          console.log('Successfully loaded slideshows:', result.slideshows);
          setSlideshows(result.slideshows);
        } else {
          console.error('Failed to load slideshows: Invalid response format', result);
          setSlideshows([]);
        }
      } else {
        console.error('Failed to load slideshows:', response.status);
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

  const loadCollections = async () => {
    setIsLoadingCollections(true);
    try {
      const response = await fetch('/api/slideshow/collections?includeImages=true');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.collections) {
          console.log('Successfully loaded collections:', result.collections);
          setUserCollections(result.collections);
        } else {
          console.error('Failed to load collections: Invalid response format', result);
          setUserCollections([]);
        }
      } else {
        console.error('Failed to load collections:', response.status);
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

  const createSlideshow = async (title: string, switchToEditor: boolean = true) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/slideshow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.slideshow) {
          console.log('Successfully created slideshow:', result.slideshow);
          setSlideshows([...slideshows, result.slideshow]);
          setCurrentSlideshow(result.slideshow);
          setSlides([]);
          if (switchToEditor) {
            setActiveTab('editor');
          }
        } else {
          console.error('Failed to create slideshow: Invalid response format', result);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to create slideshow:', errorData.message);
      }
    } catch (error) {
      console.error('Failed to create slideshow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCollection = async (name: string, description: string) => {
    setIsCreatingCollection(true);
    try {
      const response = await fetch('/api/slideshow/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const newCollection = data.success ? data.collection : data;
        setUserCollections([...userCollections, { ...newCollection, images: [] }]);
        setIsCreateCollectionModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
    } finally {
      setIsCreatingCollection(false);
    }
  };

  const deleteCollection = async (collectionId: string) => {
    setIsDeletingCollection(true);
    try {
      const response = await fetch(`/api/slideshow/collections/${collectionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setUserCollections(collections => 
          collections.filter(collection => collection.id !== collectionId)
        );
        setIsDeleteModalOpen(false);
        setCollectionToDelete(null);
        
        if (openedCollection?.id === collectionId) {
          setOpenedCollection(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete collection:', error);
    } finally {
      setIsDeletingCollection(false);
    }
  };

  const uploadImage = async (file: File, collectionId: string) => {
    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('collectionId', collectionId);
    
    try {
      const response = await fetch('/api/slideshow/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const responseData = await response.json();
        const newImage = responseData.success ? responseData.image : responseData;
        
        setUserCollections(collections =>
          collections.map(collection =>
            collection.id === collectionId
              ? { ...collection, images: [...collection.images, newImage] }
              : collection
          )
        );
        
        if (openedCollection?.id === collectionId) {
          setOpenedCollection(prev => prev ? { 
            ...prev, 
            images: [...prev.images, newImage] 
          } : null);
        }
        
        return newImage;
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData.message);
        alert(`Upload failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const generateAIImage = async (prompt: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/slideshow/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      if (response.ok) {
        const generatedImage = await response.json();
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
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSlide = async (imageUrl: string, text: string = '') => {
    if (!currentSlideshow) {
      console.error('No current slideshow available');
      return;
    }
    
    console.log('Adding slide with imageUrl:', imageUrl);
    console.log('Current slideshow:', currentSlideshow);
    
    // Create initial text element if text is provided
    const textElements = text ? [createDefaultTextElement(text)] : [];
    
    try {
      const requestBody = {
        slideshowId: currentSlideshow.id,
        imageUrl,
        textElements,
        order: slides.length,
      };
      
      console.log('Sending request to add slide:', requestBody);
      
      const response = await fetch('/api/slideshow/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.success && result.slide) {
          console.log('Successfully added slide:', result.slide);
          setSlides([...slides, result.slide]);
          // Auto-select the newly added slide
          setSelectedSlide(result.slide);
        } else {
          console.error('Failed to add slide: Invalid response format', result);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to add slide:', errorData.message);
      }
    } catch (error) {
      console.error('Failed to add slide:', error);
    }
  };

  const updateSlideText = async (slideId: string, text: string) => {
    try {
      // Create or update the first text element with the new text
      const textElements: TextElement[] = text ? [createDefaultTextElement(text)] : [];

      const response = await fetch(`/api/slideshow/slides/${slideId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textElements }),
      });
      
      if (response.ok) {
        setSlides(slides.map(slide =>
          slide.id === slideId ? { ...slide, textElements } : slide
        ));
        if (selectedSlide?.id === slideId) {
          setSelectedSlide({ ...selectedSlide, textElements });
        }
      }
    } catch (error) {
      console.error('Failed to update slide:', error);
    }
  };

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

  const loadSlideshow = async (slideshowId: string) => {
    try {
      const response = await fetch(`/api/slideshow/${slideshowId}`);
      if (response.ok) {
        const slideshow = await response.json();
        console.log('Successfully loaded slideshow:', slideshow);
        setCurrentSlideshow(slideshow);
        // Migrate slides to new format for backward compatibility
        const migratedSlides = migrateSlidesToNewFormat(slideshow.slides || []);
        setSlides(migratedSlides);
        setActiveTab('editor');
      } else {
        const errorData = await response.json();
        console.error('Failed to load slideshow:', errorData.message);
      }
    } catch (error) {
      console.error('Failed to load slideshow:', error);
    }
  };

  // Event Handlers
  const handleDeleteCollection = (collection: ImageCollection) => {
    setCollectionToDelete(collection);
    setIsDeleteModalOpen(true);
  };

  const handlePreviewSlideshow = (slideshow: Slideshow) => {
    setCurrentSlideshow(slideshow);
    setSlideshowPreview(true);
  };

  const openCollection = (collection: ImageCollection) => {
    setOpenedCollection(collection);
  };

  const closeCollection = () => {
    setOpenedCollection(null);
  };

  // Phase 1 Editor Handlers using Zustand Store
  const handleSelectSlide = (slide: Slide) => {
    console.log('Selecting slide:', slide);
    setSelectedSlide(slide);
    setSelectedTextElement(null);
  };

  const handleAddSlideFromEditor = async () => {
    console.log('handleAddSlideFromEditor called, currentSlideshow:', currentSlideshow);
    // If no slideshow exists, create one first
    if (!currentSlideshow) {
      const title = `Slideshow ${slideshows.length + 1}`;
      console.log('Creating new slideshow:', title);
      await createSlideshow(title, false); // Don't switch tabs since we're already in editor
      // After creating slideshow, open the image picker modal
      console.log('Opening image picker modal after slideshow creation');
      setIsImagePickerModalOpen(true);
      return;
    }
    // Open image picker modal instead of switching tabs
    console.log('Opening image picker modal');
    setIsImagePickerModalOpen(true);
  };

  const handleAddTextElement = () => {
    if (!selectedSlide) return;
    
    const newTextElement: TextElement = {
      id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: 'New text element',
      position: { x: 20, y: 30 },
      size: { width: 60, height: 10 },
      fontFamily: 'Arial',
      fontSize: 18,
      color: '#FFFFFF',
      zIndex: 1
    };

    const updatedSlide = {
      ...selectedSlide,
      textElements: [...(selectedSlide.textElements || []), newTextElement]
    };

    setSlides(prev => prev.map(slide => 
      slide.id === selectedSlide.id ? updatedSlide : slide
    ));
    setSelectedSlide(updatedSlide);
    setSelectedTextElement(newTextElement);
  };

  const handleUpdateTextElement = (textElement: TextElement) => {
    if (!selectedSlide) return;
    
    const updatedSlide = {
      ...selectedSlide,
      textElements: selectedSlide.textElements.map(el =>
        el.id === textElement.id ? textElement : el
      )
    };

    setSlides(prev => prev.map(slide => 
      slide.id === selectedSlide.id ? updatedSlide : slide
    ));
    setSelectedSlide(updatedSlide);
    setSelectedTextElement(textElement);

    // Auto-save changes to backend
    updateSlideTextElements(selectedSlide.id, updatedSlide.textElements);
  };

  const handleDeleteTextElement = (textElementId: string) => {
    if (!selectedSlide) return;
    
    const updatedSlide = {
      ...selectedSlide,
      textElements: selectedSlide.textElements.filter(el => el.id !== textElementId)
    };

    setSlides(prev => prev.map(slide => 
      slide.id === selectedSlide.id ? updatedSlide : slide
    ));
    setSelectedSlide(updatedSlide);
    setSelectedTextElement(null);

    // Auto-save changes to backend
    updateSlideTextElements(selectedSlide.id, updatedSlide.textElements);
  };

  const handleReorderSlides = async (reorderedSlides: Slide[]) => {
    setSlides(reorderedSlides);
    
    // Update backend with new order
    try {
      const response = await fetch('/api/slideshow/slides', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideshowId: currentSlideshow?.id,
          slides: reorderedSlides.map(slide => ({
            id: slide.id,
            order: slide.order,
            textElements: slide.textElements,
            imageUrl: slide.imageUrl
          }))
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to update slide order');
      }
    } catch (error) {
      console.error('Failed to update slide order:', error);
    }
  };

  // Helper function to update slide text elements
  const updateSlideTextElements = async (slideId: string, textElements: TextElement[]) => {
    try {
      const response = await fetch(`/api/slideshow/slides/${slideId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textElements }),
      });
      
      if (!response.ok) {
        console.error('Failed to auto-save text elements');
      }
    } catch (error) {
      console.error('Failed to auto-save text elements:', error);
    }
  };

  // Initialize data
  useEffect(() => {
    loadSlideshows();
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
            <SlideshowGrid
              slideshows={slideshows}
              onCreateSlideshow={createSlideshow}
              onLoadSlideshow={loadSlideshow}
              onPreviewSlideshow={handlePreviewSlideshow}
              isLoading={isLoading}
            />
          </TabsContent>

          {/* Editor Tab - Phase 1 Implementation */}
          <TabsContent value="editor" className="h-[calc(100vh-12rem)]">
            <SlideshowEditorLayout
              leftPanel={
                <SlideStrip
                  slides={slides}
                  selectedSlideId={selectedSlide?.id || null}
                  onSelectSlide={handleSelectSlide}
                  onDeleteSlide={deleteSlide}
                  onAddSlide={handleAddSlideFromEditor}
                  onReorderSlides={handleReorderSlides}
                />
              }
              centerPanel={
                <EditingCanvas
                  selectedSlide={selectedSlide}
                  selectedTextElement={selectedTextElement}
                  onAddTextElement={handleAddTextElement}
                  onSelectTextElement={setSelectedTextElement}
                  onUpdateTextElement={handleUpdateTextElement}
                  onDeleteTextElement={handleDeleteTextElement}
                  slides={slides}
                  onSelectSlide={handleSelectSlide}
                />
              }
              rightPanel={
                <StylingToolbar
                  selectedTextElement={selectedTextElement}
                  currentSlideshow={currentSlideshow}
                  onUpdateTextElement={handleUpdateTextElement}
                  onAddTextElement={handleAddTextElement}
                />
              }
            />
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-4 space-x-4">
            {openedCollection ? (
              <CollectionDetail
                collection={openedCollection}
                currentSlideshow={currentSlideshow}
                isUploadingImage={isUploadingImage}
                onClose={closeCollection}
                onUploadImage={uploadImage}
                onAddSlide={addSlide}
              />
            ) : (
              <CollectionGrid
                userCollections={userCollections}
                isLoadingCollections={isLoadingCollections}
                isUploadingImage={isUploadingImage}
                onOpenCollection={openCollection}
                onCreateCollection={() => setIsCreateCollectionModalOpen(true)}
                onDeleteCollection={handleDeleteCollection}
                onUploadImage={uploadImage}
              />
            )}
          </TabsContent>

          {/* AI Generate Tab */}
          <TabsContent value="ai-generate" className="space-y-4">
            <AIImageGenerator
              onGenerateImage={generateAIImage}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <CreateCollectionModal
          isOpen={isCreateCollectionModalOpen}
          onClose={() => setIsCreateCollectionModalOpen(false)}
          onCreateCollection={createCollection}
          isCreating={isCreatingCollection}
        />

        <DeleteCollectionModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCollectionToDelete(null);
          }}
          collectionToDelete={collectionToDelete}
          onDeleteCollection={deleteCollection}
          isDeleting={isDeletingCollection}
        />

        <ImagePickerModal
          isOpen={isImagePickerModalOpen}
          onClose={() => setIsImagePickerModalOpen(false)}
          userCollections={userCollections}
          currentSlideshow={currentSlideshow}
          isUploadingImage={isUploadingImage}
          onUploadImage={uploadImage}
          onAddSlide={addSlide}
          onCreateCollection={() => {
            setIsImagePickerModalOpen(false);
            setIsCreateCollectionModalOpen(true);
          }}
        />
      </div>
    </div>
  );
};

export default SlideshowPage;