import React from 'react';

interface TextEditorProps {
  text: string;
  fontSize: number;
  textColor: string;
  textOpacity: number;
  onTextChange: (text: string) => void;
  onFontSizeChange: (fontSize: number) => void;
  onColorChange: (color: string) => void;
  onOpacityChange: (opacity: number) => void;

}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  fontSize,
  textColor,
  onTextChange,
  onFontSizeChange,
  onColorChange,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Text Editor</h3>
      
      <div className="space-y-4">
        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Text Content
          </label>
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
            maxLength={200}
          />
          <div className="text-xs text-gray-400 mt-1">
            {text.length}/200 characters
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Font Size: {fontSize}px
          </label>
          <input
            type="range"
            min="24"
            max="120"
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>24px</span>
            <span>120px</span>
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Text Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={textColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-12 h-12 border-2 border-gray-600 rounded-lg cursor-pointer bg-gray-700"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => onColorChange(e.target.value)}
              placeholder="#ffffff"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 font-mono text-sm"
            />
          </div>
        </div>

        {/* Preset Colors */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Quick Colors
          </label>
          <div className="flex space-x-2">
            {[
              '#ffffff', '#000000', '#ff0000', '#00ff00', 
              '#0000ff', '#ffff00', '#ff00ff', '#00ffff'
            ].map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                  textColor === color ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
        }
      `}</style>
    </div>
  );
};