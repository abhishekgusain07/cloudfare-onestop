import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useEditorStore } from '@/store/editorStore';
import type { TimelineTrack } from '@/store/editorStore';

interface TimelineClipProps {
  clip: TimelineTrack['clips'][0];
  trackId: string;
  onMove: (clipId: string, newStartTime: number) => void;
}

const TimelineClip = ({ clip, trackId, onMove }: TimelineClipProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'CLIP',
    item: { id: clip.id, trackId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as any}
      className={`absolute h-full bg-blue-500 rounded cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{
        left: `${clip.startTime}px`,
        width: `${clip.duration}px`,
      }}
    />
  );
};

interface TimelineTrackProps {
  track: TimelineTrack;
  onMoveClip: (clipId: string, newStartTime: number) => void;
}

const TimelineTrack = ({ track, onMoveClip }: TimelineTrackProps) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'CLIP',
    drop: (item: { id: string; trackId: string }, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        onMoveClip(item.id, Math.max(0, delta.x));
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop as any}
      className={`h-16 border-b border-gray-200 relative ${
        isOver ? 'bg-gray-100' : ''
      }`}
    >
      {track.clips.map((clip) => (
        <TimelineClip
          key={clip.id}
          clip={clip}
          trackId={track.id}
          onMove={onMoveClip}
        />
      ))}
    </div>
  );
};

export const Timeline = () => {
  const tracks = useEditorStore((state) => state.tracks);
  const currentTime = useEditorStore((state) => state.currentTime);
  const updateTrack = useEditorStore((state) => state.updateTrack);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const handleMoveClip = (trackId: string, clipId: string, newStartTime: number) => {
    updateTrack(trackId, {
      clips: tracks
        .find((t) => t.id === trackId)
        ?.clips.map((clip) =>
          clip.id === clipId ? { ...clip, startTime: newStartTime } : clip
        ),
    });
  };

  return (
    <div className="flex flex-col w-full h-64 bg-white border-t border-gray-200">
      <div className="flex items-center justify-between p-2 border-b border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="px-2 py-1 text-sm bg-gray-100 rounded"
          >
            -
          </button>
          <button
            onClick={() => setScale((s) => s + 0.1)}
            className="px-2 py-1 text-sm bg-gray-100 rounded"
          >
            +
          </button>
        </div>
      </div>
      <div
        ref={timelineRef}
        className="flex-1 overflow-x-auto"
        style={{ transform: `scaleX(${scale})` }}
      >
        <div className="relative min-w-full">
          {tracks.map((track) => (
            <TimelineTrack
              key={track.id}
              track={track}
              onMoveClip={(clipId, newStartTime) =>
                handleMoveClip(track.id, clipId, newStartTime)
              }
            />
          ))}
          <div
            className="absolute top-0 bottom-0 w-px bg-red-500"
            style={{ left: `${currentTime}px` }}
          />
        </div>
      </div>
    </div>
  );
}; 