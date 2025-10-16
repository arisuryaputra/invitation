'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';

interface PaletteItemProps {
  id: string;
  children: React.ReactNode;
}

export function PaletteItem({ id, children }: PaletteItemProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: id,
    data: {
      isPaletteItem: true,
      type: id,
    },
  });

  return (
    <Button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      variant="outline"
      className="cursor-grab w-full justify-start mb-2"
    >
      {children}
    </Button>
  );
}