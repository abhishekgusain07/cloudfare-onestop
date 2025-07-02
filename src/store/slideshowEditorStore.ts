import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import debounce from 'lodash.debounce';
import { Slideshow, Slide, TextElement, ImageCollection } from '@/app/slideshow/types';

interface SlideshowEditorState {
  // Core slideshow data
  currentSlideshow: Slideshow | null;
  slides: Slide[];
  userCollections: ImageCollection[];
  
  // Selection state
  selectedSlide: Slide | null;
  selectedTextElement: TextElement | null;
  
  // UI state
  isLoading: boolean;
  isUploadingImage: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  
  // Actions
  setCurrentSlideshow: (slideshow: Slideshow | null) => void;
  setSlides: (slides: Slide[]) => void;
  addSlide: (slide: Slide) => void;
  updateSlide: (slideId: string, updates: Partial<Slide>) => void;
  deleteSlide: (slideId: string) => void;
  reorderSlides: (slides: Slide[]) => void;
  
  setSelectedSlide: (slide: Slide | null) => void;
  setSelectedTextElement: (element: TextElement | null) => void;
  
  addTextElement: (slideId: string, textElement: TextElement) => void;
  updateTextElement: (slideId: string, textElement: TextElement) => void;
  deleteTextElement: (slideId: string, textElementId: string) => void;
  
  setUserCollections: (collections: ImageCollection[]) => void;
  addCollection: (collection: ImageCollection) => void;
  updateCollection: (collectionId: string, updates: Partial<ImageCollection>) => void;
  deleteCollection: (collectionId: string) => void;
  
  setIsLoading: (loading: boolean) => void;
  setIsUploadingImage: (uploading: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  
  // Auto-save functionality
  triggerAutoSave: () => void;
}

// Debounced auto-save function that will be initialized with the store
let debouncedAutoSave: (() => void) | null = null;

export const useSlideshowEditorStore = create<SlideshowEditorState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      currentSlideshow: null,
      slides: [],
      userCollections: [],
      selectedSlide: null,
      selectedTextElement: null,
      isLoading: false,
      isUploadingImage: false,
      isSaving: false,
      lastSaved: null,

      // Slideshow actions
      setCurrentSlideshow: (slideshow) => set({ currentSlideshow: slideshow }),
      
      setSlides: (slides) => set({ slides }),
      
      addSlide: (slide) => set((state) => ({
        slides: [...state.slides, slide]
      })),
      
      updateSlide: (slideId, updates) => set((state) => ({
        slides: state.slides.map(slide =>
          slide.id === slideId ? { ...slide, ...updates } : slide
        ),
        selectedSlide: state.selectedSlide?.id === slideId 
          ? { ...state.selectedSlide, ...updates }
          : state.selectedSlide
      })),
      
      deleteSlide: (slideId) => set((state) => ({
        slides: state.slides.filter(slide => slide.id !== slideId),
        selectedSlide: state.selectedSlide?.id === slideId ? null : state.selectedSlide,
        selectedTextElement: state.selectedSlide?.id === slideId ? null : state.selectedTextElement
      })),
      
      reorderSlides: (slides) => {
        set({ slides });
        get().triggerAutoSave();
      },

      // Selection actions
      setSelectedSlide: (slide) => set({ 
        selectedSlide: slide,
        selectedTextElement: null // Clear text selection when changing slides
      }),
      
      setSelectedTextElement: (element) => set({ selectedTextElement: element }),

      // Text element actions
      addTextElement: (slideId, textElement) => set((state) => {
        const updatedSlides = state.slides.map(slide =>
          slide.id === slideId
            ? { ...slide, textElements: [...slide.textElements, textElement] }
            : slide
        );
        
        return {
          slides: updatedSlides,
          selectedSlide: state.selectedSlide?.id === slideId
            ? { ...state.selectedSlide, textElements: [...state.selectedSlide.textElements, textElement] }
            : state.selectedSlide,
          selectedTextElement: textElement
        };
      }),
      
      updateTextElement: (slideId, textElement) => set((state) => {
        const updatedSlides = state.slides.map(slide =>
          slide.id === slideId
            ? {
                ...slide,
                textElements: slide.textElements.map(el =>
                  el.id === textElement.id ? textElement : el
                )
              }
            : slide
        );
        
        return {
          slides: updatedSlides,
          selectedSlide: state.selectedSlide?.id === slideId
            ? {
                ...state.selectedSlide,
                textElements: state.selectedSlide.textElements.map(el =>
                  el.id === textElement.id ? textElement : el
                )
              }
            : state.selectedSlide,
          selectedTextElement: textElement
        };
      }),
      
      deleteTextElement: (slideId, textElementId) => set((state) => {
        const updatedSlides = state.slides.map(slide =>
          slide.id === slideId
            ? {
                ...slide,
                textElements: slide.textElements.filter(el => el.id !== textElementId)
              }
            : slide
        );
        
        return {
          slides: updatedSlides,
          selectedSlide: state.selectedSlide?.id === slideId
            ? {
                ...state.selectedSlide,
                textElements: state.selectedSlide.textElements.filter(el => el.id !== textElementId)
              }
            : state.selectedSlide,
          selectedTextElement: state.selectedTextElement?.id === textElementId ? null : state.selectedTextElement
        };
      }),

      // Collection actions
      setUserCollections: (collections) => set({ userCollections: collections }),
      
      addCollection: (collection) => set((state) => ({
        userCollections: [...state.userCollections, collection]
      })),
      
      updateCollection: (collectionId, updates) => set((state) => ({
        userCollections: state.userCollections.map(collection =>
          collection.id === collectionId ? { ...collection, ...updates } : collection
        )
      })),
      
      deleteCollection: (collectionId) => set((state) => ({
        userCollections: state.userCollections.filter(collection => collection.id !== collectionId)
      })),

      // UI state actions
      setIsLoading: (loading) => set({ isLoading: loading }),
      setIsUploadingImage: (uploading) => set({ isUploadingImage: uploading }),
      setIsSaving: (saving) => set({ isSaving: saving }),

      // Auto-save trigger
      triggerAutoSave: () => {
        if (debouncedAutoSave) {
          debouncedAutoSave();
        }
      }
    }))
  )
);

// Initialize debounced auto-save function
const initializeAutoSave = () => {
  debouncedAutoSave = debounce(async () => {
    const state = useSlideshowEditorStore.getState();
    
    if (!state.currentSlideshow) return;
    
    state.setIsSaving(true);
    
    try {
      // Auto-save current slideshow and slides
      const response = await fetch(`/api/slideshow/${state.currentSlideshow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: state.slides.map(slide => ({
            id: slide.id,
            order: slide.order,
            textElements: slide.textElements,
            imageUrl: slide.imageUrl
          }))
        }),
      });
      
      if (response.ok) {
        console.log('Auto-saved successfully');
        // Update last saved timestamp
        useSlideshowEditorStore.setState({ lastSaved: new Date() });
      } else {
        console.error('Auto-save failed:', response.status);
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      state.setIsSaving(false);
    }
  }, 2000); // 2 second debounce
};

// Initialize auto-save when store is created
initializeAutoSave();

// Subscribe to changes that should trigger auto-save
useSlideshowEditorStore.subscribe(
  (state) => state.slides,
  () => {
    const state = useSlideshowEditorStore.getState();
    if (state.currentSlideshow) {
      state.triggerAutoSave();
    }
  }
);

// Utility selector hooks for common patterns
export const useCurrentSlideshow = () => useSlideshowEditorStore((state) => state.currentSlideshow);
export const useSlides = () => useSlideshowEditorStore((state) => state.slides);
export const useSelectedSlide = () => useSlideshowEditorStore((state) => state.selectedSlide);
export const useSelectedTextElement = () => useSlideshowEditorStore((state) => state.selectedTextElement);
export const useUserCollections = () => useSlideshowEditorStore((state) => state.userCollections);

// Individual loading state selectors to avoid object creation and infinite loops
export const useIsLoading = () => useSlideshowEditorStore((state) => state.isLoading);
export const useIsUploadingImage = () => useSlideshowEditorStore((state) => state.isUploadingImage);
export const useIsSaving = () => useSlideshowEditorStore((state) => state.isSaving);
export const useLastSaved = () => useSlideshowEditorStore((state) => state.lastSaved); 