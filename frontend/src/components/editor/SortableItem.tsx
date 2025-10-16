'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Import invitation components
import Countdown from '@/components/invitation/Countdown';
import GuestBook from '@/components/invitation/GuestBook';
import GiftRegistry from '@/components/invitation/GiftRegistry';
import ImageGallery from '@/components/invitation/ImageGallery';
import MusicPlayer from '@/components/invitation/MusicPlayer';

// A generic component to render our invitation components based on type
const componentMap: { [key: string]: React.ComponentType<any> } = {
  countdown: Countdown,
  guest_book: GuestBook,
  gift_registry: GiftRegistry,
  image_gallery: ImageGallery,
  music_player: MusicPlayer,
};

export function SortableItem({ id, componentData }: { id: string, componentData: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Component = componentMap[componentData.type];

  // MusicPlayer is positioned fixed, so it shouldn't be part of the sortable layout flow.
  if (componentData.type === 'music_player') {
      return <Component {...componentData.props} />
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-4 my-2 bg-gray-100 border rounded-md cursor-grab touch-none">
      {Component ? <Component {...componentData.props} /> : <div>Unknown Component: {componentData.type}</div>}
    </div>
  );
}