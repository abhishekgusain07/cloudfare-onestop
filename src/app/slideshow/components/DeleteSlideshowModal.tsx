'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from 'lucide-react';
import { Slideshow } from '../types';

interface DeleteSlideshowModalProps {
  isOpen: boolean;
  onClose: () => void;
  slideshowToDelete: Slideshow | null;
  onDeleteSlideshow: (slideshowId: string) => Promise<void>;
  isDeleting: boolean;
}

export const DeleteSlideshowModal = ({
  isOpen,
  onClose,
  slideshowToDelete,
  onDeleteSlideshow,
  isDeleting
}: DeleteSlideshowModalProps) => {
  const handleDelete = async () => {
    if (!slideshowToDelete) return;
    await onDeleteSlideshow(slideshowToDelete.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Delete Slideshow
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{slideshowToDelete?.title}"? This action is irreversible and will permanently delete all slides in this slideshow.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="min-w-[120px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Forever
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 