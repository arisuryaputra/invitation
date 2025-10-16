'use client';

import React from 'react';
import type { Invitation } from '@/services/invitation.service';

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
  if (!invitation) {
    return <div className="text-center p-10 text-red-500">Error: Invitation data is missing.</div>;
  }

  const musicPlayerComponent = invitation.components.find(c => c.type === 'music_player');

  return (
    <main className="bg-gray-50 min-h-screen">
      {musicPlayerComponent && <MusicPlayer {...musicPlayerComponent.props} />}
      <div className="w-full max-w-3xl mx-auto p-4 md:p-8 space-y-8">
        {invitation.components.map(component => {
          const Component = componentMap[component.type];
          if (!Component || component.type === 'music_player') {
            return null;
          }
          return (
            <div key={component.id}>
              <Component {...component.props} />
            </div>
          );
        })}
      </div>
    </main>
  );
}