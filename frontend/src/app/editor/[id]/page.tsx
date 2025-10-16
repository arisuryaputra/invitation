'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Import invitation components
import Countdown from '@/components/invitation/Countdown';
import GuestBook from '@/components/invitation/GuestBook';
import GiftRegistry from '@/components/invitation/GiftRegistry';
import ImageGallery from '@/components/invitation/ImageGallery';

import { SortableItem } from '@/components/editor/SortableItem';

interface PageProps {
  params: { id: string };
}

export default function EditorPage({ params }: PageProps) {
  const { id: invitationId } = params;
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invitationId) {
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
    }
  }, [invitationId]);

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setComponents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    fetch(`http://localhost:3001/api/invitations/${invitationId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ components }),
    })
    .then(res => res.json())
    .then(data => {
        alert('Layout saved!');
        console.log('Save response:', data);
    })
    .catch(err => {
        console.error("Failed to save layout", err);
        alert('Error saving layout.');
    });
  };


  if (loading) {
    return <div>Loading Editor...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Component Palette (Left Sidebar) */}
      <div className="w-1/4 bg-white p-4 border-r">
        <h2 className="text-lg font-bold mb-4">Components</h2>
        {/* This will be populated with draggable components */}
        <div className="p-2 border rounded-md bg-gray-100 mb-2">Countdown</div>
        <div className="p-2 border rounded-md bg-gray-100 mb-2">Guest Book</div>
        <div className="p-2 border rounded-md bg-gray-100 mb-2">Gift Registry</div>
        <div className="p-2 border rounded-md bg-gray-100 mb-2">Image Gallery</div>
      </div>

      {/* Canvas (Main Area) */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Invitation Editor</h1>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Save Layout
            </button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="w-full max-w-3xl mx-auto bg-white p-4 rounded-lg shadow-lg">
                {components.map(component => (
                    <SortableItem key={component.id} id={component.id} componentData={component} />
                ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Properties Panel (Right Sidebar) */}
      <div className="w-1/4 bg-white p-4 border-l">
        <h2 className="text-lg font-bold mb-4">Properties</h2>
        {/* This will show options for the selected component */}
        <p className="text-sm text-gray-500">Select a component to edit its properties.</p>
      </div>
    </div>
  );
}