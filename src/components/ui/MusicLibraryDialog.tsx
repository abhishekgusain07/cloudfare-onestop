import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { getAudioInfo } from '@/utils/audioProcessing';

interface MusicTrack {
  id: string;
  userId: string;
  title: string;
  filename: string;
  url: string;
  duration: number;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  lastUsed?: string;
}

interface MusicLibraryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMusicSelect: (music: MusicTrack) => void;
  userId?: string;
}

export const MusicLibraryDialog: React.FC<MusicLibraryDialogProps> = ({
  isOpen,
  onClose,
  onMusicSelect,
  userId = 'demo-user', // TODO: Get from auth context
}) => {
  const [musicLibrary, setMusicLibrary] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load music library when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadMusicLibrary();
    }
  }, [isOpen]);

  const loadMusicLibrary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/music?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setMusicLibrary(data.music);
      } else {
        toast.error('Failed to load music library');
      }
    } catch (error) {
      console.error('Error loading music library:', error);
      toast.error('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast.error('Please select a valid audio file (MP3, WAV, M4A, OGG)');
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get audio duration first
      setUploadProgress(10);
      const tempUrl = URL.createObjectURL(file);
      const audioInfo = await getAudioInfo(tempUrl);
      URL.revokeObjectURL(tempUrl);

      setUploadProgress(30);

      // Create FormData for direct upload
      const formData = new FormData();
      formData.append('music', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, "")); // Remove extension for title
      
      setUploadProgress(50);

      // Upload using the new direct upload API
      const response = await fetch('/api/music/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload music file');
      }

      const { success, music } = await response.json();
      
      if (!success || !music) {
        throw new Error('Upload response was not successful');
      }

      // Update the music record with correct duration
      const updatedMusic = {
        ...music,
        duration: Math.round(audioInfo.duration)
      };

      setUploadProgress(90);

      // Update duration in database
      try {
        await fetch(`/api/music/${music.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            duration: Math.round(audioInfo.duration)
          }),
        });
      } catch (error) {
        console.warn('Failed to update duration, but upload succeeded:', error);
      }

      setUploadProgress(100);
      
      // Add to library and auto-select
      setMusicLibrary(prev => [updatedMusic, ...prev]);
      onMusicSelect(updatedMusic);
      
      toast.success('Music uploaded successfully!');
      onClose();

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload music. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleMusicSelect = async (music: MusicTrack) => {
    try {
      // Update last used timestamp
      await fetch(`/api/music/${music.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ duration: music.duration }),
      });

      onMusicSelect(music);
      onClose();
    } catch (error) {
      console.error('Error updating music usage:', error);
      // Still proceed with selection even if usage update fails
      onMusicSelect(music);
      onClose();
    }
  };

  const handleDeleteMusic = async (musicId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent selection when deleting

    if (!confirm('Are you sure you want to delete this music track?')) {
      return;
    }

    try {
      const response = await fetch(`/api/music/${musicId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setMusicLibrary(prev => prev.filter(music => music.id !== musicId));
        toast.success('Music deleted successfully');
      } else {
        toast.error('Failed to delete music');
      }
    } catch (error) {
      console.error('Error deleting music:', error);
      toast.error('Failed to delete music');
    }
  };

  const filteredMusic = musicLibrary.filter(music =>
    music.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    music.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Music Library</DialogTitle>
          <DialogDescription>
            Select music from your library or upload a new track
          </DialogDescription>
        </DialogHeader>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-border rounded-lg p-4 mb-4">
          <div className="text-center">
            {isUploading ? (
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium">Uploading...</div>
                  <div className="text-xs text-muted-foreground">{uploadProgress}% complete</div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-2"
                  >
                    Upload New Music
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    MP3, WAV, M4A, OGG (max 50MB)
                  </div>
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Search your music library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Music Library Grid */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-sm text-muted-foreground">Loading your music...</div>
            </div>
          ) : filteredMusic.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'No matching music found' : 'No music in your library'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery ? 'Try a different search term' : 'Upload your first music track to get started'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMusic.map((music) => (
                <div
                  key={music.id}
                  onClick={() => handleMusicSelect(music)}
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate" title={music.title}>
                        {music.title}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate" title={music.filename}>
                        {music.filename}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteMusic(music.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-red-500 hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDuration(music.duration)}</span>
                    <span>{formatFileSize(music.fileSize)}</span>
                  </div>

                  <div className="flex gap-1 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {music.mimeType.split('/')[1].toUpperCase()}
                    </Badge>
                    {music.lastUsed && (
                      <Badge variant="outline" className="text-xs">
                        Recently Used
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {filteredMusic.length} track{filteredMusic.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};