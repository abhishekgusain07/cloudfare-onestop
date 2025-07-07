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
    <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold mb-4 text-slate-100">Text Editor</h3>
      
      <div className="space-y-4">
        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-200">
            Text Content
          </label>
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full bg-slate-800/80 border border-slate-600/50 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 resize-none transition-all duration-200"
            rows={3}
            maxLength={200}
          />
          <div className="text-xs text-slate-400 mt-1">
            {text.length}/200 characters
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-200">
            Font Size: {fontSize}px
          </label>
          <input
            type="range"
            min="24"
            max="120"
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-700/50 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>24px</span>
            <span>120px</span>
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-200">
            Text Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={textColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-12 h-12 border-2 border-slate-600/50 rounded-lg cursor-pointer bg-slate-800/80"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => onColorChange(e.target.value)}
              placeholder="#ffffff"
              className="flex-1 bg-slate-800/80 border border-slate-600/50 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 font-mono text-sm transition-all duration-200"
            />
          </div>
        </div>

        {/* Preset Colors */}
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-200">
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
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 hover:shadow-lg ${
                  textColor === color ? 'border-blue-400 shadow-lg shadow-blue-400/25' : 'border-slate-600/50'
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
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
          cursor: pointer;
          border: 2px solid #1e40af;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
          cursor: pointer;
          border: 2px solid #1e40af;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
};