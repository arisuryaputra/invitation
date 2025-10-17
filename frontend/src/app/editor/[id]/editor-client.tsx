'use client';

import React, { useState, useMemo } from 'react';
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
import { SectionComponent } from '@/components/editor/SectionComponent';
import { ColumnComponent } from '@/components/editor/ColumnComponent';
import { saveInvitation } from '@/services/invitation.service';
import type { Invitation, Section, Column, Component } from '@/services/invitation.service';

const generateUniqueId = (prefix: 'sec' | 'col' | 'comp') => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const getFutureDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString();
};

const PALETTE_COMPONENTS = [
  { id: 'countdown', name: 'Countdown', defaultProps: { title: 'Countdown to Our Big Day!', targetDate: getFutureDate() } },
  { id: 'guest_book', name: 'Guest Book', defaultProps: {} },
  { id: 'gift_registry', name: 'Gift Registry', defaultProps: {} },
  { id: 'image_gallery', name: 'Image Gallery', defaultProps: { images: [] } },
  { id: 'music_player', name: 'Music Player', defaultProps: { songUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' } },
];

export default function EditorClientPage({ initialData, invitationId }: { initialData: Invitation, invitationId: string }) {
  const [sections, setSections] = useState<Section[]>(initialData.sections);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  }));

  const items = useMemo(() => {
    const allItems: { [key: string]: any } = {};
    sections.forEach(section => {
      allItems[section.id] = { ...section, type: 'Section' };
      section.columns.forEach(column => {
        allItems[column.id] = { ...column, type: 'Column', parent: section.id };
        column.components.forEach(component => {
          allItems[component.id] = { ...component, type: 'Component', parent: column.id };
        });
      });
    });
    return allItems;
  }, [sections]);

  const handleDragStart = (event: DragStartEvent) => {
      const { id, data } = event.active;
      if (data.current?.isPaletteItem) {
          setActiveItem({ id, type: 'PaletteItem', name: data.current.name });
      } else {
          setActiveItem(items[id as string]);
      }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    // Find the containers
    const activeContainerId = active.data.current?.parent;
    const overContainerId = over.data.current?.parent || over.id;

    // Handle dropping a new component from the palette
    if (active.data.current?.isPaletteItem) {
        if (over.data.current?.type === 'Column') {
            const paletteComponent = PALETTE_COMPONENTS.find(c => c.id === active.id);
            if (!paletteComponent) return;

            const newComponent: Component = {
                id: generateUniqueId('comp'),
                type: paletteComponent.id,
                props: { ...paletteComponent.defaultProps },
            };

            setSections(prevSections => {
                return prevSections.map(section => ({
                    ...section,
                    columns: section.columns.map(column => {
                        if (column.id === overContainerId) {
                            return { ...column, components: [...column.components, newComponent] };
                        }
                        return column;
                    })
                }));
            });
        }
        return;
    }

    // Handle reordering items
    if (active.id !== over.id) {
        if (activeItem.type === 'Component' && over.data.current?.type === 'Component' && activeContainerId === overContainerId) {
            // Reordering components within the same column
            setSections(prevSections => {
                return prevSections.map(s => ({
                    ...s,
                    columns: s.columns.map(c => {
                        if (c.id === activeContainerId) {
                            const oldIndex = c.components.findIndex(comp => comp.id === active.id);
                            const newIndex = c.components.findIndex(comp => comp.id === over.id);
                            return { ...c, components: arrayMove(c.components, oldIndex, newIndex) };
                        }
                        return c;
                    })
                }));
            });
        }
        // Add more complex reordering logic for sections and columns here if needed
    }
  };

  const handleAddSection = () => {
    const newSection: Section = {
      id: generateUniqueId('sec'),
      columns: [{ id: generateUniqueId('col'), components: [] }],
    };
    setSections(current => [...current, newSection]);
  };

  const handleRemoveSection = (sectionId: string) => {
    setSections(current => current.filter(s => s.id !== sectionId));
  };

  const handleAddColumn = (sectionId: string) => {
     setSections(current => current.map(s => {
         if (s.id === sectionId) {
             const newColumn: Column = { id: generateUniqueId('col'), components: [] };
             return { ...s, columns: [...s.columns, newColumn] };
         }
         return s;
     }));
  };

  const handleRemoveColumn = (columnId: string) => {
      setSections(current => current.map(s => ({
          ...s,
          columns: s.columns.filter(c => c.id !== columnId)
      })));
  };

  const handleRemoveComponent = (componentId: string) => {
    setSections(current => current.map(s => ({
        ...s,
        columns: s.columns.map(c => ({
            ...c,
            components: c.components.filter(comp => comp.id !== componentId)
        }))
    })));
  };

  const handleUpdateComponent = (updatedProps: any) => {
    if (!editingComponent) return;
    setSections(items => items.map(s => ({
        ...s,
        columns: s.columns.map(c => ({
            ...c,
            components: c.components.map(comp =>
                comp.id === editingComponent.id ? { ...comp, props: updatedProps } : comp
            )
        }))
    })));
    setEditingComponent(null);
  };

  const handleSave = async () => {
    const result = await saveInvitation(invitationId, sections);
    if (result) alert('Layout saved!');
    else alert('Error saving layout.');
  };

  // Render functions for nested sortable contexts
  const renderComponent = (component: Component) => (
    <SortableItem
      key={component.id}
      id={component.id}
      componentData={component}
      onRemove={handleRemoveComponent}
      onEdit={() => setEditingComponent(component)}
      onUpdate={(id, newProps) => handleUpdateComponent({ ...component, props: newProps })}
    />
  );

  const renderColumn = (column: Column, sectionId: string) => (
    <ColumnComponent
      key={column.id}
      column={column}
      onRemoveColumn={() => handleRemoveColumn(column.id)}
      renderComponent={renderComponent}
    />
  );

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-gray-100 font-sans">
        <aside className="w-64 bg-white p-4 border-r overflow-y-auto flex-shrink-0">
          <h2 className="text-lg font-semibold mb-4">Add Elements</h2>
          <Button onClick={handleAddSection} className="w-full mb-4">Add Section</Button>
          <hr className="my-4"/>
          <h3 className="text-md font-semibold mb-2">Components</h3>
          {PALETTE_COMPONENTS.map(comp => (
            <PaletteItem key={comp.id} id={comp.id} name={comp.name}>
              {comp.name}
            </PaletteItem>
          ))}
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Invitation Editor</h1>
            <div className="flex space-x-2">
                <Button variant="outline" onClick={() => window.open(`/invitation/${invitationId}`, '_blank')}>Preview</Button>
                <Button onClick={handleSave}>Save</Button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto bg-white p-4 rounded-lg shadow-lg">
            <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map(section => (
                <SectionComponent
                  key={section.id}
                  section={section}
                  onRemoveSection={() => handleRemoveSection(section.id)}
                  onAddColumn={() => handleAddColumn(section.id)}
                  renderColumn={renderColumn}
                />
              ))}
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
        {activeItem && activeItem.type === 'PaletteItem' ? (
          <div className="p-2 border rounded-md bg-white shadow-lg cursor-grabbing">{activeItem.name}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}