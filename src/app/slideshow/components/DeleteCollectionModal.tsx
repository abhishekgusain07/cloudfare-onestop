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
import { ImageCollection } from '../types';

interface DeleteCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionToDelete: ImageCollection | null;
  onDeleteCollection: (collectionId: string) => Promise<void>;
  isDeleting: boolean;
}

export const DeleteCollectionModal = ({
  isOpen,
  onClose,
  collectionToDelete,
  onDeleteCollection,
  isDeleting
}: DeleteCollectionModalProps) => {
  const handleDelete = async () => {
    if (!collectionToDelete) return;
    await onDeleteCollection(collectionToDelete.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Delete Collection
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{collectionToDelete?.name}"? This action is irreversible and will permanently delete all images in this collection.
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