'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Type, 
  Plus, 
  Palette, 
  Move, 
  Save, 
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline
} from 'lucide-react';
import { TextElement, Slideshow } from '../types';
import { useIsSaving, useLastSaved } from '@/store/slideshowEditorStore';

interface StylingToolbarProps {
  selectedTextElement: TextElement | null;
  currentSlideshow: Slideshow | null;
  onUpdateTextElement: (textElement: TextElement) => void;
  onAddTextElement?: () => void;
}

// Common font families for better UX
const FONT_FAMILIES = [
  { value: 'Arial', label: 'Arial', category: 'Sans-serif' },
  { value: 'Helvetica', label: 'Helvetica', category: 'Sans-serif' },
  { value: 'Georgia', label: 'Georgia', category: 'Serif' },
  { value: 'Times New Roman', label: 'Times New Roman', category: 'Serif' },
  { value: 'Courier New', label: 'Courier New', category: 'Monospace' },
  { value: 'Verdana', label: 'Verdana', category: 'Sans-serif' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS', category: 'Sans-serif' },
  { value: 'Impact', label: 'Impact', category: 'Display' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS', category: 'Display' },
];

// Predefined color palette
const COLOR_PALETTE = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#008000', '#000080',
  '#FFFFE0', '#FFE4E1', '#E6E6FA', '#F0F8FF', '#F5F5DC'
];

// Font size presets
const FONT_SIZE_PRESETS = [
  { label: 'Small', value: 12 },
  { label: 'Normal', value: 16 },
  { label: 'Large', value: 24 },
  { label: 'XL', value: 32 },
  { label: 'XXL', value: 48 },
  { label: 'Huge', value: 72 }
];

export const StylingToolbar = ({
  selectedTextElement,
  currentSlideshow,
  onUpdateTextElement,
  onAddTextElement
}: StylingToolbarProps) => {
  const isSaving = useIsSaving();
  const lastSaved = useLastSaved();

  const handleTextChange = (value: string) => {
    if (!selectedTextElement) return;
    onUpdateTextElement({ ...selectedTextElement, text: value });
  };

  const handleFontFamilyChange = (value: string) => {
    if (!selectedTextElement) return;
    onUpdateTextElement({ ...selectedTextElement, fontFamily: value });
  };

  const handleFontSizeChange = (value: string) => {
    if (!selectedTextElement) return;
    const fontSize = parseInt(value);
    if (!isNaN(fontSize)) {
      onUpdateTextElement({ ...selectedTextElement, fontSize });
    }
  };

  const handleFontSizePreset = (fontSize: number) => {
    if (!selectedTextElement) return;
    onUpdateTextElement({ ...selectedTextElement, fontSize });
  };

  const handleColorChange = (color: string) => {
    if (!selectedTextElement) return;
    onUpdateTextElement({ ...selectedTextElement, color });
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (!currentSlideshow) {
    return (
      <div className="h-full bg-gray-50 p-4 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Type className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No Slideshow Selected</h3>
            <p className="text-sm">Create or select a slideshow to start editing</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Styling Panel</h2>
          <div className="flex items-center gap-2">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
            <Badge variant={isSaving ? "default" : "secondary"} className="text-xs">
              {isSaving ? "Saving..." : "Saved"}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Last saved: {formatLastSaved(lastSaved)}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full p-4 space-y-4 overflow-y-auto">
          {/* Add Text Element Button */}
          {onAddTextElement && (
            <Button 
              onClick={onAddTextElement}
              className="w-full"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Text Element
            </Button>
          )}

          {selectedTextElement ? (
            <div className="space-y-4">
            {/* Text Content */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Text Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="text-content">Text</Label>
                  <textarea
                    id="text-content"
                    value={selectedTextElement.text}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Enter your text..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Typography
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Font Family */}
                <div>
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select
                    value={selectedTextElement.fontFamily}
                    onValueChange={handleFontFamilyChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_FAMILIES.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <div className="flex items-center justify-between w-full">
                            <span style={{ fontFamily: font.value }}>{font.label}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {font.category}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Size */}
                <div>
                  <Label htmlFor="font-size">Font Size</Label>
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-1">
                      {FONT_SIZE_PRESETS.map((preset) => (
                        <Button
                          key={preset.value}
                          variant={selectedTextElement.fontSize === preset.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFontSizePreset(preset.value)}
                          className="text-xs"
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                    <Input
                      id="font-size"
                      type="number"
                      value={selectedTextElement.fontSize}
                      onChange={(e) => handleFontSizeChange(e.target.value)}
                      min="8"
                      max="200"
                      step="1"
                      className="text-center"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Color Palette</Label>
                  <div className="max-h-32 overflow-y-auto mt-2">
                    <div className="grid grid-cols-5 gap-2">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className={`w-8 h-8 rounded-md border-2 transition-all ${
                            selectedTextElement.color === color 
                              ? 'border-blue-500 scale-110' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label htmlFor="custom-color">Custom Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="custom-color"
                      type="color"
                      value={selectedTextElement.color}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-12 h-8 p-1 border rounded cursor-pointer"
                    />
                    <Input
                      value={selectedTextElement.color}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="flex-1 font-mono text-xs"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Position & Size */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Move className="w-4 h-4" />
                  Position & Size
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Position (%)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="number"
                      value={Math.round(selectedTextElement.position.x)}
                      onChange={(e) => {
                        const x = parseFloat(e.target.value);
                        if (!isNaN(x)) {
                          onUpdateTextElement({
                            ...selectedTextElement,
                            position: { ...selectedTextElement.position, x }
                          });
                        }
                      }}
                      min="0"
                      max="100"
                      step="1"
                      placeholder="X"
                    />
                    <Input
                      type="number"
                      value={Math.round(selectedTextElement.position.y)}
                      onChange={(e) => {
                        const y = parseFloat(e.target.value);
                        if (!isNaN(y)) {
                          onUpdateTextElement({
                            ...selectedTextElement,
                            position: { ...selectedTextElement.position, y }
                          });
                        }
                      }}
                      min="0"
                      max="100"
                      step="1"
                      placeholder="Y"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Size (%)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="number"
                      value={Math.round(selectedTextElement.size.width)}
                      onChange={(e) => {
                        const width = parseFloat(e.target.value);
                        if (!isNaN(width)) {
                          onUpdateTextElement({
                            ...selectedTextElement,
                            size: { ...selectedTextElement.size, width }
                          });
                        }
                      }}
                      min="1"
                      max="100"
                      step="1"
                      placeholder="Width"
                    />
                    <Input
                      type="number"
                      value={Math.round(selectedTextElement.size.height)}
                      onChange={(e) => {
                        const height = parseFloat(e.target.value);
                        if (!isNaN(height)) {
                          onUpdateTextElement({
                            ...selectedTextElement,
                            size: { ...selectedTextElement.size, height }
                          });
                        }
                      }}
                      min="1"
                      max="100"
                      step="1"
                      placeholder="Height"
                    />
                  </div>
                </div>

                <div>
                  <Label>Z-Index</Label>
                  <Input
                    type="number"
                    value={selectedTextElement.zIndex}
                    onChange={(e) => {
                      const zIndex = parseInt(e.target.value);
                      if (!isNaN(zIndex)) {
                        onUpdateTextElement({
                          ...selectedTextElement,
                          zIndex
                        });
                      }
                    }}
                    min="0"
                    max="999"
                    step="1"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-8">
            <Type className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No Text Element Selected</h3>
            <p className="text-sm">Select a text element on the canvas to edit its properties</p>
            {onAddTextElement && (
              <Button 
                onClick={onAddTextElement}
                className="mt-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Text Element
              </Button>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}; 