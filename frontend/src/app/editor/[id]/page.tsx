import React from 'react';
import EditorClientPage from './editor-client';
import { getInvitationById } from '@/services/invitation.service';
import type { Invitation } from '@/services/invitation.service';

interface PageProps {
  params: { id: string };
}

// This is a React Server Component (RSC)
// It fetches data on the server and passes it to the client component.
export default async function EditorPage({ params }: PageProps) {
  const { id } = params;
  const initialData = await getInvitationById(id);

  if (!initialData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Invitation not found or failed to load.</p>
      </div>
    );
  }

  // Pass the fetched data and id to the client component
  return <EditorClientPage initialData={initialData} invitationId={id} />;
}