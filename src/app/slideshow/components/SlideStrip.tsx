'use client';

import { Button } from '@/components/ui/button';
import { Plus, Trash2, Image as ImageIcon, GripVertical } from 'lucide-react';
import { Slide } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

interface SlideStripProps {
  slides: Slide[];
  selectedSlideId: string | null;
  onSelectSlide: (slide: Slide) => void;
  onDeleteSlide: (slideId: string) => Promise<void>;
  onAddSlide: () => void;
  onReorderSlides?: (reorderedSlides: Slide[]) => void;
  isLoading?: boolean;
}

// Sortable slide item component
interface SortableSlideItemProps {
  slide: Slide;
  index: number;
  isSelected: boolean;
  onSelect: (slide: Slide) => void;
  onDelete: (slideId: string) => Promise<void>;
}

const SortableSlideItem = ({ 
  slide, 
  index, 
  isSelected, 
  onSelect, 
  onDelete 
}: SortableSlideItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300'
      } ${isDragging ? 'z-50' : ''}`}
      onClick={() => onSelect(slide)}
    >
      {/* Slide Number Badge */}
      <div className="absolute -top-2 -left-2 bg-gray-900 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium z-10">
        {index + 1}
      </div>

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -top-2 -right-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-3 h-3" />
      </div>

      {/* Slide Thumbnail */}
      <div className="aspect-video bg-gray-100 rounded-md overflow-hidden mb-3 relative">
        <img
          src={slide.imageUrl}
          alt={`Slide ${index + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.error-placeholder')) {
              const errorDiv = document.createElement('div');
              errorDiv.className = 'error-placeholder absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400';
              errorDiv.innerHTML = '<div class="text-center"><div class="text-2xl mb-1">📷</div><div class="text-xs">Image failed to load</div></div>';
              parent.appendChild(errorDiv);
            }
          }}
        />
        
        {/* Text Elements Indicator */}
        {slide.textElements && slide.textElements.length > 0 && (
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {slide.textElements.length} text{slide.textElements.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Slide Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 font-medium">
          Slide {index + 1}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(slide.id);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export const SlideStrip = ({
  slides,
  selectedSlideId,
  onSelectSlide,
  onDeleteSlide,
  onAddSlide,
  onReorderSlides,
  isLoading = false
}: SlideStripProps) => {
  console.log('SlideStrip received slides:', slides);
  console.log('Selected slide ID:', selectedSlideId);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedSlides = slides.sort((a, b) => a.order - b.order);
  console.log('Sorted slides:', sortedSlides);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sortedSlides.findIndex((slide) => slide.id === active.id);
      const newIndex = sortedSlides.findIndex((slide) => slide.id === over?.id);

      const reorderedSlides = arrayMove(sortedSlides, oldIndex, newIndex).map((slide, index) => ({
        ...slide,
        order: index
      }));

      if (onReorderSlides) {
        onReorderSlides(reorderedSlides);
      }
    }
  };
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Slides</h3>
          <span className="text-sm text-gray-500">
            {slides.length} slide{slides.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Button
          onClick={onAddSlide}
          size="sm"
          className="w-full"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          {slides.length === 0 ? 'Create Slideshow' : 'Add Slide'}
        </Button>
      </div>

      {/* Slides List */}
      <div className="flex-1 overflow-y-auto p-3">
        {sortedSlides.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedSlides.map(slide => slide.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {sortedSlides.map((slide, index) => (
                  <SortableSlideItem
                    key={slide.id}
                    slide={slide}
                    index={index}
                    isSelected={selectedSlideId === slide.id}
                    onSelect={onSelectSlide}
                    onDelete={onDeleteSlide}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="bg-gray-100 rounded-full p-4 mb-4">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Ready to Create?</h4>
            <p className="text-sm text-gray-600 mb-4">
              Start by creating a new slideshow, then add your images from the Images tab.
            </p>
            <Button
              onClick={onAddSlide}
              size="sm"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Slideshow
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 