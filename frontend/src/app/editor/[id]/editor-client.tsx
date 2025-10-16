'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { SortableItem } from '@/components/editor/SortableItem';
import { PaletteItem } from '@/components/editor/PaletteItem';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { saveInvitation } from '@/services/invitation.service';
import type { Invitation, Component } from '@/services/invitation.service';

const generateUniqueId = () => `comp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
const getFutureDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString();
};

const availableComponents = [
  { id: 'countdown', name: 'Countdown', defaultProps: { title: 'Countdown to Our Big Day!', targetDate: getFutureDate() } },
  { id: 'guest_book', name: 'Guest Book', defaultProps: {} },
  { id: 'gift_registry', name: 'Gift Registry', defaultProps: {} },
  { id: 'image_gallery', name: 'Image Gallery', defaultProps: { images: [] } },
  { id: 'music_player', name: 'Music Player', defaultProps: { songUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' } },
];

export default function EditorClientPage({ initialData, invitationId }: { initialData: Invitation, invitationId: string }) {
  const [components, setComponents] = useState<Component[]>(initialData.components);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10,
    },
  }));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const isPaletteItem = active.data.current?.isPaletteItem;

    if (isPaletteItem) {
      const paletteComponent = availableComponents.find(c => c.id === active.id);
      if (!paletteComponent) return;

      const newComponent: Component = {
        id: generateUniqueId(),
        type: paletteComponent.id,
        props: paletteComponent.defaultProps || {},
      };

      const overId = over.id;
      // The canvas itself has an ID of 'canvas'
      const overIsCanvas = overId === 'canvas';

      setComponents(current => {
        const overIndex = current.findIndex(c => c.id === overId);
        if (overIsCanvas) {
          // If dropped on the canvas placeholder, add to the end
          return [...current, newComponent];
        }
        if (overIndex !== -1) {
          // If dropped on an existing item, insert before it
          const newItems = [...current];
          newItems.splice(overIndex, 0, newComponent);
          return newItems;
        }
        return current; // Should not happen, but as a fallback
      });
    } else {
      // Reorder existing components
      if (active.id !== over.id) {
        setComponents((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
  };

  const handleRemoveComponent = (idToRemove: string) => {
    setComponents((items) => items.filter(item => item.id !== idToRemove));
  };

  const handleEditComponent = (idToEdit: string) => {
    const component = components.find(c => c.id === idToEdit);
    if (component) {
      setEditingComponent(component);
    }
  };

  const handleUpdateComponent = (updatedProps: any) => {
    if (!editingComponent) return;
    setComponents(items => items.map(item => {
        if (item.id === editingComponent.id) {
            return { ...item, props: updatedProps };
        }
        return item;
    }));
    setEditingComponent(null);
  };

  const handleSave = async () => {
    const result = await saveInvitation(invitationId, components);
    if (result) {
      alert('Layout saved!');
    } else {
      alert('Error saving layout.');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ components }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `invitation-${invitationId}.json`);
    linkElement.click();
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="flex h-screen bg-gray-100 font-sans">
        <aside className="w-64 bg-white p-4 border-r overflow-y-auto flex-shrink-0">
          <h2 className="text-lg font-semibold mb-4">Add Components</h2>
          {availableComponents.map(comp => (
            <PaletteItem key={comp.id} id={comp.id}>
              {comp.name}
            </PaletteItem>
          ))}
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Invitation Editor</h1>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => window.open(`/invitation/${invitationId}`, '_blank')}>Preview</Button>
              <Button variant="outline" onClick={handleExport}>Export</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>

          <div className="max-w-3xl mx-auto bg-white p-4 rounded-lg shadow-lg">
            <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="min-h-[400px]" id="canvas">
                {components.map(component => (
                  <SortableItem
                    key={component.id}
                    id={component.id}
                    componentData={component}
                    onRemove={handleRemoveComponent}
                    onEdit={handleEditComponent}
                  />
                ))}
                {components.filter(c => c.type !== 'music_player').length === 0 && (
                   <div className="text-center py-20 border-2 border-dashed rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Drag components from the left panel and drop them here.</p>
                   </div>
                )}
              </div>
            </SortableContext>
          </div>
        </main>
      </div>

      <PropertiesPanel
        isOpen={!!editingComponent}
        onClose={() => setEditingComponent(null)}
        component={editingComponent}
        onUpdate={handleUpdateComponent}
      />

      <DragOverlay>
        {activeId && availableComponents.find(c => c.id === activeId) ?
          <div className="p-2 border rounded-md bg-white shadow-lg cursor-grabbing">
            {availableComponents.find(c => c.id === activeId)?.name}
          </div> :
          null}
      </DragOverlay>
    </DndContext>
  );
}