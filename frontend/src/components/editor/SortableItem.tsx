'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Settings } from 'lucide-react';

// Import invitation components
import Countdown from '@/components/invitation/Countdown';
import GuestBook from '@/components/invitation/GuestBook';
import GiftRegistry from '@/components/invitation/GiftRegistry';
import ImageGallery from '@/components/invitation/ImageGallery';
import MusicPlayer from '@/components/invitation/MusicPlayer';

const Placeholder = ({ height }: { height: string }) => (
  <div
    style={{ height }}
    className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg"
  />
);

const componentMap: { [key: string]: React.ComponentType<any> } = {
  countdown: Countdown,
  guest_book: GuestBook,
  gift_registry: GiftRegistry,
  image_gallery: ImageGallery,
  music_player: MusicPlayer,
  placeholder: Placeholder,
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
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Component = componentMap[componentData.type];

  // Music player is a special case, rendered without drag handles/remove buttons
  if (componentData.type === 'music_player') {
    return <Component {...componentData.props} />;
  }

  // Placeholder doesn't need drop zones
  if (componentData.type === 'placeholder') {
    return (
      <div ref={setNodeRef} style={style}>
        <Component {...componentData.props} />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group mb-4">
      <DropZone id={`${id}-top`} className="absolute top-0 h-1/2 w-full" />
      <DropZone id={`${id}-bottom`} className="absolute bottom-0 h-1/2 w-full" />
      <div className="absolute top-2 right-2 z-10 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur-sm rounded-md">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={() => onEdit(id)}
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={() => onRemove(id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none"
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

const DropZone = ({ id, className }: { id: string; className: string }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'bg-blue-200/50' : ''}`}
    />
  );
};