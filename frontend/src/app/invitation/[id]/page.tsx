import React from 'react';
import InvitationClientPage from './client-page';
import { getInvitationById } from '@/services/invitation.service';
import type { Invitation } from '@/services/invitation.service';

interface PageProps {
  params: { id: string };
}

// This is a React Server Component (RSC)
export default async function InvitationPage({ params }: PageProps) {
  const { id } = params;
  const invitationData: Invitation | null = await getInvitationById(id);

  if (!invitationData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Invitation not found or failed to load.</p>
      </div>
    );
  }

  return <InvitationClientPage invitation={invitationData} />;
}