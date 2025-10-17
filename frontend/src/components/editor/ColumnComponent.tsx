'use client';

import React from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../ui/button';
import { Grip, Trash2 } from 'lucide-react';
import type { Column, Component } from '@/services/invitation.service';

interface ColumnProps {
  column: Column;
  onRemoveColumn: (id: string) => void;
  renderComponent: (component: Component) => React.ReactNode;
}

export function ColumnComponent({ column, onRemoveColumn, renderComponent }: ColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      children: column.components,
    },
  });

  const { setNodeRef: droppableRef } = useDroppable({
    id: column.id,
    data: { type: 'Column' }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group flex-1 bg-gray-50 p-4 border rounded-md min-h-[100px]">
        {/* Column Controls */}
        <div className="absolute -top-3 -right-3 z-10 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button {...attributes} {...listeners} variant="ghost" size="icon" className="cursor-grab h-8 w-8"><Grip/></Button>
            <Button onClick={() => onRemoveColumn(column.id)} variant="destructive" size="icon" className="h-8 w-8"><Trash2/></Button>
        </div>

        <div ref={droppableRef} className="space-y-4">
            <SortableContext items={column.components.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {column.components.map(component => renderComponent(component))}
            </SortableContext>

            {column.components.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-10">
                    Drop components here
                </div>
            )}
        </div>
    </div>
  );
}