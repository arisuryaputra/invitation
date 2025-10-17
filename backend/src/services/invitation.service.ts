import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// --- Paths ---
const dbPath = path.join(__dirname, '..', '..', 'db');
const templatesPath = path.join(dbPath, 'templates.json');
const invitationsPath = path.join(dbPath, 'invitations.json');

// --- Interfaces for the new nested structure ---
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
  sections: Section[]; // Changed from 'components' to 'sections'
}

export interface Template {
  id: string;
  name: string;
  description: string;
  // Templates will now also follow the Section > Column > Component structure
  defaultSections: Omit<Section, 'id' | 'columns'> & {
      columns: (Omit<Column, 'id' | 'components'> & {
          components: Omit<Component, 'id'>[];
      })[];
  }[];
}


// --- Data Access Functions ---
const readData = async <T>(filePath: string): Promise<T[]> => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T[];
  } catch (error: any) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
};

const writeData = async <T>(filePath: string, data: T[]): Promise<void> => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// --- Helper to generate nested IDs ---
const generateNestedIds = (sections: any[]): Section[] => {
    return sections.map(section => ({
        ...section,
        id: `sec-${crypto.randomUUID()}`,
        columns: section.columns.map((column: any) => ({
            ...column,
            id: `col-${crypto.randomUUID()}`,
            components: column.components.map((component: any) => ({
                ...component,
                id: `comp-${crypto.randomUUID()}`
            }))
        }))
    }));
};


// --- Service Functions ---

export const getTemplates = async (): Promise<Template[]> => {
  return readData<Template>(templatesPath);
};

export const createNewInvitation = async (templateId?: string, importedSections?: any[]): Promise<Invitation> => {
  const invitations = await readData<Invitation>(invitationsPath);
  let newInvitation: Invitation;

  if (templateId) {
    const templates = await getTemplates();
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error("Template not found");
    }
    newInvitation = {
      id: `inv-${crypto.randomUUID()}`,
      templateId: template.id,
      createdAt: new Date().toISOString(),
      sections: generateNestedIds(template.defaultSections),
    };
  } else if (importedSections) {
    newInvitation = {
      id: `inv-${crypto.randomUUID()}`,
      templateId: 'custom',
      createdAt: new Date().toISOString(),
      sections: generateNestedIds(importedSections),
    };
  } else {
    // Create a blank invitation with one empty section and column
    newInvitation = {
      id: `inv-${crypto.randomUUID()}`,
      templateId: 'blank',
      createdAt: new Date().toISOString(),
      sections: [{
          id: `sec-${crypto.randomUUID()}`,
          columns: [{
              id: `col-${crypto.randomUUID()}`,
              components: []
          }]
      }],
    };
  }

  invitations.push(newInvitation);
  await writeData(invitationsPath, invitations);
  return newInvitation;
};

export const getInvitationById = async (id: string): Promise<Invitation | undefined> => {
  const invitations = await readData<Invitation>(invitationsPath);
  return invitations.find(inv => inv.id === id);
};

export const updateInvitationById = async (id: string, updatedData: Partial<Invitation>): Promise<Invitation | null> => {
  const invitations = await readData<Invitation>(invitationsPath);
  const index = invitations.findIndex(inv => inv.id === id);

  if (index === -1) {
    return null; // Not found
  }

  // Only update the 'sections' property
  invitations[index].sections = updatedData.sections || invitations[index].sections;

  await writeData(invitationsPath, invitations);
  return invitations[index];
};