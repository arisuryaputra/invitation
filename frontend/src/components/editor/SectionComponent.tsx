'use client';

import React from 'react';
import { useSortable, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ColumnComponent } from './ColumnComponent';
import { Button } from '../ui/button';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import type { Section, Column } from '@/services/invitation.service';

interface SectionProps {
  section: Section;
  onRemoveSection: (id: string) => void;
  onAddColumn: (sectionId: string) => void;
  renderColumn: (column: Column, sectionId: string) => React.ReactNode;
}

export function SectionComponent({ section, onRemoveSection, onAddColumn, renderColumn }: SectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    data: {
      type: 'Section',
      children: section.columns,
    },
  });

  const { setNodeRef: droppableRef } = useDroppable({
      id: section.id,
      data: { type: 'Section' }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group p-4 bg-gray-100 border-2 border-dashed rounded-lg mb-4">
        {/* Section Controls */}
        <div className="absolute -top-3 -left-3 z-10 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button {...attributes} {...listeners} variant="ghost" size="icon" className="cursor-grab h-8 w-8"><GripVertical/></Button>
            <Button onClick={() => onRemoveSection(section.id)} variant="destructive" size="icon" className="h-8 w-8"><Trash2/></Button>
        </div>

        <div ref={droppableRef} className="flex gap-4 min-h-[100px]">
            <SortableContext items={section.columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                {section.columns.map(column => renderColumn(column, section.id))}
            </SortableContext>

            <Button onClick={() => onAddColumn(section.id)} variant="outline" className="self-center">
                <Plus className="mr-2 h-4 w-4" /> Add Column
            </Button>
        </div>
    </div>
  );
}