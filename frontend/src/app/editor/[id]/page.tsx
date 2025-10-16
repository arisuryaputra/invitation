import React from 'react';
import EditorClientPage from './editor-client';

interface PageProps {
  params: { id: string };
}

async function getInvitationData(invitationId: string) {
  try {
    const res = await fetch(`http://localhost:3001/api/invitations/${invitationId}`, {
      cache: 'no-store', // Ensure fresh data for the editor
    });

    if (!res.ok) {
      console.error(`Failed to fetch invitation: ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("An error occurred while fetching invitation data:", error);
    return null;
  }
}

// This is now a React Server Component (RSC)
export default async function EditorPage({ params }: PageProps) {
  const { id } = params;
  const initialData = await getInvitationData(id);

  if (!initialData) {
    return <div className="flex h-screen items-center justify-center">Invitation not found or failed to load.</div>;
  }

  return <EditorClientPage initialData={initialData} invitationId={id} />;
}