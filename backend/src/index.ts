import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const app = express();
const port = 3001;

const dbPath = path.join(__dirname, '..', 'db'); // Adjust path to be relative to src
const templatesPath = path.join(dbPath, 'templates.json');
const invitationsPath = path.join(dbPath, 'invitations.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// --- Helper Functions ---
const readData = async (filePath: string): Promise<any[]> => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
};

const writeData = async (filePath: string, data: any): Promise<void> => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// --- API Endpoints ---

// Get all available templates
app.get('/api/templates', async (req: Request, res: Response) => {
  try {
    const templates = await readData(templatesPath);
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: "Error reading templates" });
  }
});

// Create a new invitation
app.post('/api/invitations', async (req: Request, res: Response) => {
  try {
    const { templateId, components: importedComponents } = req.body;

    let newInvitation;
    const invitations = await readData(invitationsPath);

    if (templateId) {
      const templates = await readData(templatesPath);
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      newInvitation = {
        id: `inv-${crypto.randomUUID()}`,
        templateId: template.id,
        createdAt: new Date().toISOString(),
        components: template.defaultComponents.map((c: any) => ({ ...c, id: `comp-${crypto.randomUUID()}` })),
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

    res.status(201).json(newInvitation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating invitation" });
  }
});

// Get a specific invitation by ID
app.get('/api/invitations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invitations = await readData(invitationsPath);
    const invitation = invitations.find(inv => inv.id === id);

    if (invitation) {
      res.json(invitation);
    } else {
      res.status(404).json({ message: "Invitation not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error reading invitation data" });
  }
});

// Update an invitation
app.put('/api/invitations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    let invitations = await readData(invitationsPath);
    const index = invitations.findIndex(inv => inv.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    invitations[index] = {
        ...invitations[index],
        ...updatedData,
        id: invitations[index].id,
        createdAt: invitations[index].createdAt
    };

    await writeData(invitationsPath, invitations);
    res.json(invitations[index]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating invitation" });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});