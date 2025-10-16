'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SortableItem } from '@/components/editor/SortableItem';
import { PaletteItem } from '@/components/editor/PaletteItem';
import crypto from 'crypto';

interface PageProps {
  params: { id: string };
}

const availableComponents = [
  { id: 'countdown', name: 'Countdown' },
  { id: 'guest_book', name: 'Guest Book' },
  { id: 'gift_registry', name: 'Gift Registry' },
  { id: 'image_gallery', name: 'Image Gallery' },
  { id: 'music_player', name: 'Music Player' },
];

export default function EditorPage({ params }: PageProps) {
  const { id: invitationId } = params;
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`http://localhost:3001/api/invitations/${invitationId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.components) {
          setComponents(data.components);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch invitation", err);
        setLoading(false);
      });
  }, [invitationId]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const isPaletteItem = active.data.current?.isPaletteItem;

    if (isPaletteItem) {
      // Add new component from palette
      const newComponent = {
        id: `comp-${crypto.randomBytes(8).toString('hex')}`,
        type: active.id,
        props: {}, // Default props
      };
      // For simplicity, add to the end. A more complex implementation could use over.id to determine position.
      setComponents(current => [...current, newComponent]);
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
    linkElement.setAttribute('download', 'invitation.json');
    linkElement.click();
  };

  if (loading) return <div>Loading Editor...</div>;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="flex h-screen bg-gray-100 font-sans">
        {/* Component Palette */}
        <div className="w-64 bg-white p-4 border-r overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Add Components</h2>
          {availableComponents.map(comp => (
            <PaletteItem key={comp.id} id={comp.id}>
              {comp.name}
            </PaletteItem>
          ))}
        </div>

        {/* Canvas */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Invitation Editor</h1>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => router.push(`/invitation/${invitationId}`)}>Preview</Button>
              <Button variant="outline" onClick={handleExport}>Export</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>

          <div className="max-w-3xl mx-auto bg-white p-4 rounded-lg shadow-lg">
            <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {components.map(component => (
                <SortableItem
                  key={component.id}
                  id={component.id}
                  componentData={component}
                  onRemove={handleRemoveComponent}
                />
              ))}
              {!components.filter(c => c.type !== 'music_player').length && (
                 <div className="text-center py-20 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Drop components here</p>
                 </div>
              )}
            </SortableContext>
          </div>
        </main>

        {/* Properties Panel (Placeholder) */}
        <aside className="w-72 bg-white p-4 border-l">
          <h2 className="text-lg font-semibold mb-4">Properties</h2>
          <div className="text-center text-sm text-gray-500">
            <p>Select a component on the canvas to see its properties.</p>
            <p className="mt-4"><i>Property editing is not yet implemented.</i></p>
          </div>
        </aside>
      </div>

      <DragOverlay>
        {activeId && activeId.startsWith('comp-') ?
          <SortableItem id={activeId} componentData={components.find(c => c.id === activeId)} onRemove={() => {}} /> :
          null}
        {activeId && availableComponents.find(c => c.id === activeId) ?
          <div className="p-2 border rounded-md bg-white shadow-lg">
            {availableComponents.find(c => c.id === activeId)?.name}
          </div> :
          null}
      </DragOverlay>
    </DndContext>
  );
}