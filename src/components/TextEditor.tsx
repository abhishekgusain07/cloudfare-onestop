import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';

export const TextEditor = () => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [color, setColor] = useState('#ffffff');
  const addTrack = useEditorStore((state) => state.addTrack);

  const handleAddText = () => {
    if (!text.trim()) return;

    const newTrack = {
      id: crypto.randomUUID(),
      type: 'text' as const,
      clips: [
        {
          id: crypto.randomUUID(),
          assetId: crypto.randomUUID(),
          startTime: 0,
          duration: 300,
          offset: 0,
        },
      ],
    };

    addTrack(newTrack);
    setText('');
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Add Text Overlay</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text Content
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={3}
            placeholder="Enter your text here..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size
            </label>
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="12"
              max="72"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Family
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text Color
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 border rounded-md"
          />
        </div>
        <button
          onClick={handleAddText}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Add Text to Timeline
        </button>
      </div>
    </div>
  );
}; 