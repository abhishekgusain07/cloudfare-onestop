"use client";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { MediaUpload } from '@/components/MediaUpload';
import { Preview } from '@/components/Preview';
import { Timeline } from '@/components/Timeline';
import { TextEditor } from '@/components/TextEditor';

const AdPage = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen bg-gray-100">
        <div className="flex-1 p-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <Preview />
              <Timeline />
            </div>
            <div className="space-y-4">
              <MediaUpload />
              <TextEditor />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default AdPage;

