'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';
import { ImageCollection } from '../types';

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCollection: (name: string, description: string) => Promise<void>;
  isCreating: boolean;
}

export const CreateCollectionModal = ({
  isOpen,
  onClose,
  onCreateCollection,
  isCreating
}: CreateCollectionModalProps) => {
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');

  const handleCreate = async () => {
    if (!newCollectionName.trim()) return;
    
    await onCreateCollection(newCollectionName, newCollectionDescription);
    
    // Reset form
    setNewCollectionName('');
    setNewCollectionDescription('');
  };

  const handleClose = () => {
    setNewCollectionName('');
    setNewCollectionDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogDescription>
            Organize your images by creating a new collection.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5">
          <div className='flex flex-col gap-2'>
            <Label htmlFor="collection-name" className='text-sm font-medium'>Name</Label>
            <Input
              id="collection-name"
              placeholder="Collection #1"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              disabled={isCreating}
            />
          </div>
          
          <div className='flex flex-col gap-2'>
            <Label htmlFor="collection-description" className='text-sm font-medium'>Description (optional)</Label>
            <Textarea
              id="collection-description"
              placeholder="Enter collection description"
              value={newCollectionDescription}
              onChange={(e) => setNewCollectionDescription(e.target.value)}
              disabled={isCreating}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={isCreating || !newCollectionName.trim()}
            className="min-w-[120px]"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Collection'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 