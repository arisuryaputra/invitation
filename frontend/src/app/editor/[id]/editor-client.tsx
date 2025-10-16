'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  useDroppable,
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

// Helper to generate unique IDs in the browser
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

export default function EditorClientPage({ initialData, invitationId }: { initialData: any, invitationId: string }) {
  const [components, setComponents] = useState<any[]>(initialData?.components || []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingComponent, setEditingComponent] = useState<any | null>(null);
  const router = useRouter();
  const lastOverId = useRef<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10,
    },
  }));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !active.data.current?.isPaletteItem || over.id === lastOverId.current) {
        return;
    }
    lastOverId.current = over.id as string;

    const overId = over.id as string;
    const isDroppingOnCanvas = overId === 'canvas-drop-area';
    const isDroppingOnDropZone = overId.includes('-top') || overId.includes('-bottom');

    const placeholderId = `placeholder-${active.id}`;
    const placeholder = { id: placeholderId, type: 'placeholder', props: { height: '60px' } };

    let newComponents = components.filter(c => c.type !== 'placeholder');

    if (isDroppingOnCanvas) {
        newComponents.push(placeholder);
    } else if (isDroppingOnDropZone) {
        const parentId = overId.split('-')[0];
        const overIndex = newComponents.findIndex(c => c.id === parentId);
        if (overIndex !== -1) {
            const insertIndex = overId.endsWith('-top') ? overIndex : overIndex + 1;
            newComponents.splice(insertIndex, 0, placeholder);
        }
    }
    setComponents(newComponents);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;
    setActiveId(null);
    lastOverId.current = null;

    const placeholderIndex = components.findIndex(c => c.type === 'placeholder');

    if (placeholderIndex === -1) {
        setComponents(current => current.filter(c => c.type !== 'placeholder'));
        return;
    }

    const paletteComponent = availableComponents.find(c => c.id === active.id);
    if (!paletteComponent) return;

    const newComponent = {
        id: generateUniqueId(),
        type: paletteComponent.id,
        props: paletteComponent.defaultProps || {},
    };

    setComponents(current => {
        const newComponents = [...current];
        newComponents.splice(placeholderIndex, 1, newComponent);
        return newComponents;
    });
  };

  const handleRemoveComponent = (idToRemove: string) => {
    setComponents((items) => items.filter(item => item.id !== idToRemove));
  };

  const handleEditComponent = (idToEdit: string) => {
    const component = components.find(c => c.id === idToEdit);
    setEditingComponent(component);
  };

  const handleUpdateComponent = (updatedProps: any) => {
    setComponents(items => items.map(item => {
        if (item.id === editingComponent.id) {
            return { ...item, props: updatedProps };
        }
        return item;
    }));
    setEditingComponent(null);
  };

  const handleSave = () => {
    fetch(`http://localhost:3001/api/invitations/${invitationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ components }),
    })
    .then(res => res.json())
    .then(() => alert('Layout saved!'))
    .catch(err => {
        console.error("Failed to save layout", err);
        alert('Error saving layout.');
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ components }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `invitation-${invitationId}.json`);
    linkElement.click();
  };

  const handleDragCancel = () => {
    // If drag is cancelled, remove any placeholder
    setComponents(current => current.filter(c => c.type !== 'placeholder'));
    setActiveId(null);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver} onDragCancel={handleDragCancel} collisionDetection={closestCenter}>
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
            <DroppableCanvas>
              <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="min-h-[400px]" id="canvas-inner">
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
            </DroppableCanvas>
          </div>
        </main>

        <aside className="w-72 bg-white p-4 border-l flex-shrink-0">
          <h2 className="text-lg font-semibold mb-4">Properties</h2>
          <div className="text-center text-sm text-gray-500 mt-10">
            <p>Click the settings icon on a component to edit its properties.</p>
          </div>
        </aside>
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

function DroppableCanvas({ children }: { children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: 'canvas-drop-area',
  });

  return (
    <div ref={setNodeRef} className="w-full h-full">
      {children}
    </div>
  );
}