import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// --- Paths and Interfaces ---
const dbPath = path.join(__dirname, '..', '..', 'db'); // Relative to the compiled dist/services directory
const templatesPath = path.join(dbPath, 'templates.json');
const invitationsPath = path.join(dbPath, 'invitations.json');

export interface Component {
  id: string;
  type: string;
  props: any;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  defaultComponents: Omit<Component, 'id'>[];
}

export interface Invitation {
  id: string;
  templateId: string;
  createdAt: string;
  components: Component[];
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

// --- Service Functions ---

export const getTemplates = async (): Promise<Template[]> => {
  return readData<Template>(templatesPath);
};

export const createNewInvitation = async (templateId?: string, importedComponents?: any[]): Promise<Invitation> => {
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
        components: template.defaultComponents.map((c: any) => {
          const newComp = { ...c, id: `comp-${crypto.randomUUID()}` };
          if (newComp.type === 'countdown' && !newComp.props.targetDate) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);
            newComp.props.targetDate = futureDate.toISOString();
          }
          return newComp;
        }),
    };
  } else if (importedComponents) {
    newInvitation = {
      id: `inv-${crypto.randomUUID()}`,
      templateId: 'custom',
      createdAt: new Date().toISOString(),
      components: importedComponents.map((c: any) => ({ ...c, id: `comp-${crypto.randomUUID()}` })),
    };
  } else {
    newInvitation = {
      id: `inv-${crypto.randomUUID()}`,
      templateId: 'blank',
      createdAt: new Date().toISOString(),
      components: [],
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

  const updatedInvitation = {
    ...invitations[index],
    ...updatedData,
    id: invitations[index].id, // Ensure ID is not overwritten
    createdAt: invitations[index].createdAt, // Ensure createdAt is not overwritten
  };

  invitations[index] = updatedInvitation;

  await writeData(invitationsPath, invitations);
  return updatedInvitation;
};