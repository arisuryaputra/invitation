'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Settings } from 'lucide-react';
import { Placeholder } from './Placeholder';

// Import invitation components
import Countdown from '@/components/invitation/Countdown';
import GuestBook from '@/components/invitation/GuestBook';
import GiftRegistry from '@/components/invitation/GiftRegistry';
import ImageGallery from '@/components/invitation/ImageGallery';
import MusicPlayer from '@/components/invitation/MusicPlayer';

const componentMap: { [key: string]: React.ComponentType<any> } = {
  countdown: Countdown,
  guest_book: GuestBook,
  gift_registry: GiftRegistry,
  image_gallery: ImageGallery,
  music_player: MusicPlayer,
  placeholder: Placeholder, // Add placeholder to the map
};

interface SortableItemProps {
  id: string;
  componentData: any;
  onRemove: (id: string) => void;
  onEdit: (id: string) => void;
}

export function SortableItem({ id, componentData, onRemove, onEdit }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      isSortableItem: true, // Mark this as a sortable item
      type: componentData.type,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Component = componentMap[componentData.type];

  if (componentData.type === 'placeholder') {
    return <div ref={setNodeRef} style={style}><Placeholder /></div>;
  }

  // Music player is a special case, rendered without drag handles/remove buttons
  if (componentData.type === 'music_player') {
    return <Component {...componentData.props} />;
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group mb-4">
      <div className="absolute top-2 right-2 z-10 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur-sm rounded-md p-1">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer h-6 w-6"
          onClick={() => onEdit(id)}
          aria-label="Edit component"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer h-6 w-6"
          onClick={() => onRemove(id)}
          aria-label="Delete component"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none h-6 w-6"
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </div>
      <div className="border rounded-lg p-4 bg-gray-50 pointer-events-none">
        {Component ? <Component {...componentData.props} /> : <div>Unknown Component</div>}
      </div>
    </div>
  );
}