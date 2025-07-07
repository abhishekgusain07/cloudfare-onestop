'use client';

import { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { TextElement } from '../types';
import { Button } from '@/components/ui/button';
import { Trash2, Edit3 } from 'lucide-react';

interface DraggableTextBoxProps {
  textElement: TextElement;
  isSelected: boolean;
  canvasWidth: number;
  canvasHeight: number;
  onSelect: (textElement: TextElement) => void;
  onUpdate: (textElement: TextElement) => void;
  onDelete: (textElementId: string) => void;
}

export const DraggableTextBox = ({
  textElement,
  isSelected,
  canvasWidth,
  canvasHeight,
  onSelect,
  onUpdate,
  onDelete
}: DraggableTextBoxProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(textElement.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Convert percentage positions to pixel positions
  const pixelPosition = {
    x: (textElement.position.x / 100) * canvasWidth,
    y: (textElement.position.y / 100) * canvasHeight
  };

  const pixelSize = {
    width: (textElement.size.width / 100) * canvasWidth,
    height: (textElement.size.height / 100) * canvasHeight
  };

  // Handle editing mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditText(textElement.text);
  };

  const handleSaveEdit = () => {
    onUpdate({
      ...textElement,
      text: editText
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(textElement.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDragStop = (e: any, data: any) => {
    const newPosition = {
      x: Math.max(0, Math.min(100, (data.x / canvasWidth) * 100)),
      y: Math.max(0, Math.min(100, (data.y / canvasHeight) * 100))
    };

    onUpdate({
      ...textElement,
      position: newPosition
    });
  };

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    const newPosition = {
      x: Math.max(0, Math.min(100, (position.x / canvasWidth) * 100)),
      y: Math.max(0, Math.min(100, (position.y / canvasHeight) * 100))
    };

    const newSize = {
      width: Math.max(10, Math.min(100, (ref.offsetWidth / canvasWidth) * 100)),
      height: Math.max(5, Math.min(100, (ref.offsetHeight / canvasHeight) * 100))
    };

    onUpdate({
      ...textElement,
      position: newPosition,
      size: newSize
    });
  };

  return (
    <Rnd
      size={{
        width: pixelSize.width,
        height: pixelSize.height
      }}
      position={{
        x: pixelPosition.x,
        y: pixelPosition.y
      }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      bounds="parent"
      minWidth={50}
      minHeight={30}
      className={`group ${isSelected ? 'z-10' : 'z-0'}`}
      onClick={() => onSelect(textElement)}
      enableResizing={isSelected}
      disableDragging={isEditing}
    >
      <div
        className={`relative w-full h-full p-2 cursor-move rounded transition-all hover:ring-2 hover:ring-blue-500 hover:ring-opacity-75 hover:bg-blue-50 hover:bg-opacity-20`}
        onDoubleClick={handleDoubleClick}
        style={{
          fontFamily: textElement.fontFamily,
          fontSize: `${Math.max(12, textElement.fontSize * (canvasWidth / 800))}px`,
          color: textElement.color,
          zIndex: textElement.zIndex,
        }}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
            className="w-full h-full resize-none border-none outline-none bg-transparent text-inherit font-inherit"
            style={{
              fontSize: 'inherit',
              fontFamily: 'inherit',
              color: 'inherit'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-center overflow-hidden">
            <span className="break-words overflow-hidden">
              {textElement.text || 'Click to edit text'}
            </span>
          </div>
        )}

        {/* Controls - Only show on hover and not editing */}
        {!isEditing && (
          <div className="absolute -top-8 left-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleDoubleClick();
              }}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(textElement.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Editing indicator */}
        {isEditing && (
          <div className="absolute -top-6 left-0 text-xs text-blue-600 font-medium">
            Press Enter to save, Esc to cancel
          </div>
        )}
      </div>
    </Rnd>
  );
}; 