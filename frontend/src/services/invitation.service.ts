// --- Shared Interfaces for a Nested Structure ---
export interface Component {
  id: string;
  type: string;
  props: any;
}

export interface Column {
  id: string;
  components: Component[];
}

export interface Section {
  id: string;
  columns: Column[];
}

export interface Invitation {
  id: string;
  templateId: string;
  createdAt: string;
  sections: Section[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
}


// --- API Service Functions ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const getInvitationById = async (id: string): Promise<Invitation | null> => {
  try {
    const res = await fetch(`${API_URL}/invitations/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Failed to fetch invitation:', error);
    return null;
  }
};

export const getTemplates = async (): Promise<Template[]> => {
    try {
        const res = await fetch(`${API_URL}/templates`);
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error('Failed to fetch templates:', error);
        return [];
    }
}

export const createInvitation = async (body: object): Promise<Invitation | null> => {
    try {
        const res = await fetch(`${API_URL}/invitations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error('Failed to create invitation:', error);
        return null;
    }
};

export const saveInvitation = async (id: string, sections: Section[]): Promise<Invitation | null> => {
    try {
        const res = await fetch(`${API_URL}/invitations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sections }), // Send the entire sections array
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error('Failed to save invitation:', error);
        return null;
    }
};