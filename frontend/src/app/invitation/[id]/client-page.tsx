'use client';

import React from 'react';
import type { Invitation, Section, Column, Component } from '@/services/invitation.service';

// Import invitation components
import Countdown from '@/components/invitation/Countdown';
import GuestBook from '@/components/invitation/GuestBook';
import GiftRegistry from '@/components/invitation/GiftRegistry';
import ImageGallery from '@/components/invitation/ImageGallery';
import MusicPlayer from '@/components/invitation/MusicPlayer';

// Component map to render components dynamically
const componentMap: { [key: string]: React.ComponentType<any> } = {
  countdown: Countdown,
  guest_book: GuestBook,
  gift_registry: GiftRegistry,
  image_gallery: ImageGallery,
  music_player: MusicPlayer,
};

interface InvitationClientPageProps {
    invitation: Invitation | null;
}

export default function InvitationClientPage({ invitation }: InvitationClientPageProps) {
  if (!invitation || !invitation.sections) {
    return <div className="text-center p-10 text-red-500">Error: Invitation data is missing or invalid.</div>;
  }

  // Find the MusicPlayer component by searching through the new nested structure
  const musicPlayerComponent = invitation.sections
    .flatMap(section => section.columns)
    .flatMap(column => column.components)
    .find(component => component.type === 'music_player');

  return (
    <main className="bg-gray-50 min-h-screen">
      {musicPlayerComponent && <MusicPlayer {...musicPlayerComponent.props} />}

      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        {invitation.sections.map((section: Section) => (
          <div key={section.id} className="flex flex-col md:flex-row gap-4">
            {section.columns.map((column: Column) => (
              <div key={column.id} className="flex-1 space-y-4">
                {column.components.map((component: Component) => {
                  const ComponentToRender = componentMap[component.type];
                  // Don't render the music player in the main flow
                  if (!ComponentToRender || component.type === 'music_player') {
                    return null;
                  }
                  return (
                    <div key={component.id}>
                      <ComponentToRender {...component.props} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}