'use client';

import React, { useState, useEffect } from 'react';

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

interface PageProps {
  params: { id: string };
}

interface ComponentData {
  id: string;
  type: string;
  props: any;
}

interface InvitationData {
  components: ComponentData[];
}

export default function InvitationPage({ params }: PageProps) {
  const { id: invitationId } = params;
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invitationId) {
      fetch(`http://localhost:3001/api/invitations/${invitationId}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || `Error: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setInvitation(data);
        })
        .catch((err) => {
          console.error("Failed to fetch invitation", err);
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [invitationId]);

  if (loading) {
    return <div className="text-center p-10">Loading Invitation...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  if (!invitation) {
    return <div className="text-center p-10">Invitation not found.</div>;
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