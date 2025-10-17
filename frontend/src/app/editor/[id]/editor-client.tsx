'use client';

import React, { useState, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
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
import { saveInvitation } from '@/services/invitation.service';
import type { Invitation, Component } from '@/services/invitation.service';

// --- Constants defined outside the component to prevent re-creation on render ---
const generateUniqueId = () => `comp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const getFutureDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString();
};

const AVAILABLE_COMPONENTS = [
  { id: 'countdown', name: 'Countdown', defaultProps: { title: 'Countdown to Our Big Day!', targetDate: getFutureDate() } },
  { id: 'guest_book', name: 'Guest Book', defaultProps: {} },
  { id: 'gift_registry', name: 'Gift Registry', defaultProps: {} },
  { id: 'image_gallery', name: 'Image Gallery', defaultProps: { images: [] } },
  { id: 'music_player', name: 'Music Player', defaultProps: { songUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' } },
];

const PLACEHOLDER_ID = 'placeholder';

// --- Component ---
export default function EditorClientPage({ initialData, invitationId }: { initialData: Invitation, invitationId: string }) {
  const [components, setComponents] = useState<Component[]>(initialData.components);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);

  const { setNodeRef } = useDroppable({ id: 'canvas' });

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  }));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragCancel = () => {
    setComponents(c => c.filter(item => item.id !== PLACEHOLDER_ID));
    setActiveId(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over || !active.data.current?.isPaletteItem) {
      return;
    }

    const isOverCanvas = over.id === 'canvas';
    const isOverSortableItem = over.data.current?.isSortableItem;

    if (!isOverCanvas && !isOverSortableItem) {
      // Remove placeholder if dragged outside a valid drop zone
      setComponents(c => c.filter(item => item.id !== PLACEHOLDER_ID));
      return;
    }

    const placeholder: Component = { id: PLACEHOLDER_ID, type: 'placeholder', props: {} };
    const overIndex = components.findIndex(c => c.id === over.id);
    const placeholderIndex = components.findIndex(c => c.id === PLACEHOLDER_ID);

    if (isOverCanvas && components.filter(c => c.type !== 'placeholder').length === 0) {
      if (placeholderIndex === -1) {
        setComponents([placeholder]);
      }
      return;
    }

    if (isOverSortableItem) {
      let newIndex: number;
      const overItemRect = over.rect;
      const overItemCenterY = overItemRect.top + overItemRect.height / 2;

      if (event.activatorEvent.clientY < overItemCenterY) {
        newIndex = overIndex;
      } else {
        newIndex = overIndex + 1;
      }

      if (placeholderIndex === -1) {
        const newComponents = [...components];
        newComponents.splice(newIndex, 0, placeholder);
        setComponents(newComponents);
      } else {
        if (placeholderIndex !== newIndex) {
          setComponents(items => {
            const newItems = items.filter(item => item.id !== PLACEHOLDER_ID);
            newItems.splice(newIndex, 0, placeholder);
            return newItems;
          });
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    // Always remove placeholder on drag end
    let finalComponents = components.filter(c => c.id !== PLACEHOLDER_ID);

    if (!over) {
      setComponents(finalComponents);
      return;
    }

    const isPaletteItem = active.data.current?.isPaletteItem;

    if (isPaletteItem) {
      const isDroppedOnCanvas = over.id === 'canvas' || over.data.current?.isSortableItem;
      if (isDroppedOnCanvas) {
        const paletteComponent = AVAILABLE_COMPONENTS.find(c => c.id === active.id);
        if (!paletteComponent) return;

        const newComponent: Component = {
          id: generateUniqueId(),
          type: paletteComponent.id,
          props: { ...paletteComponent.defaultProps },
        };

        const placeholderIndex = components.findIndex(c => c.id === PLACEHOLDER_ID);
        if (placeholderIndex !== -1) {
            finalComponents.splice(placeholderIndex, 0, newComponent);
        } else {
            // Fallback if dropped on canvas without a placeholder being present
            finalComponents.push(newComponent);
        }
        setComponents(finalComponents);
      }
    } else {
      if (active.id !== over.id) {
        const oldIndex = components.findIndex((item) => item.id === active.id);
        const newIndex = components.findIndex((item) => item.id === over.id);
        setComponents(arrayMove(components, oldIndex, newIndex));
      }
    }
  };

  const handleRemoveComponent = (idToRemove: string) => {
    setComponents((items) => items.filter(item => item.id !== idToRemove));
  };

  const handleEditComponent = (idToEdit: string) => {
    const component = components.find(c => c.id === idToEdit);
    if (component) setEditingComponent(component);
  };

  const handleUpdateComponent = (updatedProps: any) => {
    if (!editingComponent) return;
    setComponents(items => items.map(item =>
      item.id === editingComponent.id ? { ...item, props: updatedProps } : item
    ));
    setEditingComponent(null);
  };

  const handleSave = async () => {
    const result = await saveInvitation(invitationId, components);
    if (result) alert('Layout saved!');
    else alert('Error saving layout.');
  };

  const handleExport = () => {
    const exportableComponents = components.filter(c => c.id !== PLACEHOLDER_ID);
    const dataStr = JSON.stringify({ components: exportableComponents }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `invitation-${invitationId}.json`);
    linkElement.click();
  };

  const activeItem = activeId ? (components.find(c => c.id === activeId) || AVAILABLE_COMPONENTS.find(c => c.id === activeId)) : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
      <div className="flex h-screen bg-gray-100 font-sans">
        <aside className="w-64 bg-white p-4 border-r overflow-y-auto flex-shrink-0">
          <h2 className="text-lg font-semibold mb-4">Add Components</h2>
          {AVAILABLE_COMPONENTS.map(comp => (
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
            <div ref={setNodeRef} id="canvas">
              <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="min-h-[400px] space-y-4">
                    {components.map(component => (
                      <SortableItem
                        key={component.id}
                        id={component.id}
                        componentData={component}
                        onRemove={handleRemoveComponent}
                        onEdit={handleEditComponent}
                      />
                    ))}
                    {components.filter(c => c.type !== 'music_player' && c.type !== 'placeholder').length === 0 && (
                       <div className="text-center py-20 border-2 border-dashed rounded-lg flex items-center justify-center">
                          <p className="text-muted-foreground">Drag components from the left panel and drop them here.</p>
                       </div>
                    )}
                  </div>
              </SortableContext>
            </div>
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
        {activeId && activeItem ? (
          'type' in activeItem ?
            <SortableItem id={activeId} componentData={activeItem} onRemove={() => {}} onEdit={() => {}} />
          :
            <div className="p-2 border rounded-md bg-white shadow-lg cursor-grabbing">
              {(activeItem as any).name}
            </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}