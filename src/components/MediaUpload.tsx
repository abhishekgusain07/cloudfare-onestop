import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useEditorStore, MediaAsset } from '@/store/editorStore';

export const MediaUpload = () => {
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const addAsset = useEditorStore((state) => state.addAsset);
  const addTrack = useEditorStore((state) => state.addTrack);
  const assets = useEditorStore((state) => state.assets);

  // Cleanup URLs when component unmounts or assets are removed
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach(URL.revokeObjectURL);
    };
  }, [previewUrls]);

  const createVideoElement = (url: string): Promise<{ duration: number; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      const cleanup = () => {
        video.removeEventListener('loadedmetadata', onMetadata);
        video.removeEventListener('error', onError);
        video.src = '';
        video.load();
      };

      const onMetadata = () => {
        const data = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        };
        cleanup();
        resolve(data);
      };

      const onError = () => {
        cleanup();
        reject(new Error('Failed to load video metadata'));
      };

      video.addEventListener('loadedmetadata', onMetadata);
      video.addEventListener('error', onError);
      video.src = url;
    });
  };

  const createImageElement = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        for (const file of acceptedFiles) {
          const fileType = file.type.split('/')[0];
          if (!['video', 'image', 'audio'].includes(fileType)) continue;

          const id = crypto.randomUUID();
          const url = URL.createObjectURL(file);

          console.log(`Processing ${fileType} file:`, {
            name: file.name,
            type: file.type,
            size: file.size,
            url
          });

          const asset: MediaAsset = {
            id,
            type: fileType as 'video' | 'image' | 'audio',
            url,
            name: file.name,
          };

          try {
            if (fileType === 'video') {
              const metadata = await createVideoElement(url);
              asset.duration = metadata.duration;
              asset.dimensions = {
                width: metadata.width,
                height: metadata.height,
              };
              console.log('Video metadata loaded:', metadata);
            } else if (fileType === 'image') {
              const metadata = await createImageElement(url);
              asset.dimensions = metadata;
              console.log('Image metadata loaded:', metadata);
            }

            addAsset(asset);
            setPreviewUrls((prev) => ({ ...prev, [id]: url }));

            // Add a new track for video or audio
            if (fileType === 'video' || fileType === 'audio') {
              const trackId = crypto.randomUUID();
              console.log(`Adding track for ${fileType}:`, {
                trackId,
                assetId: id,
                duration: asset.duration || 300
              });

              addTrack({
                id: trackId,
                type: fileType as 'video' | 'audio',
                clips: [
                  {
                    id: crypto.randomUUID(),
                    assetId: id,
                    startTime: 0,
                    duration: asset.duration || 300,
                    offset: 0,
                  },
                ],
              });
            }
          } catch (error) {
            console.error(`Error processing ${fileType} file:`, error);
            URL.revokeObjectURL(url);
          }
        }
      } catch (error) {
        console.error('Error in onDrop:', error);
      }
    },
    [addAsset, addTrack]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
    },
  });

  return (
    <div className="w-full p-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag and drop media files here, or click to select files'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Supported formats: MP4, MOV, AVI, PNG, JPG, GIF, MP3, WAV, OGG
        </p>
      </div>
    </div>
  );
}; 