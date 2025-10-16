const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = 3001;

const dbPath = path.join(__dirname, 'db');
const templatesPath = path.join(dbPath, 'templates.json');
const invitationsPath = path.join(dbPath, 'invitations.json');

// Middleware
app.use(cors());
app.use(express.json());

// --- Helper Functions ---
const readData = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') return []; // Return empty array if file doesn't exist
    throw error;
  }
};

const writeData = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// --- API Endpoints ---

// Get all available templates
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await readData(templatesPath);
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: "Error reading templates" });
  }
});

// Create a new invitation from a template
app.post('/api/invitations', async (req, res) => {
  try {
    const { templateId } = req.body;
    if (!templateId) {
      return res.status(400).json({ message: "Template ID is required" });
    }

    const templates = await readData(templatesPath);
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    const newInvitation = {
      id: `inv-${crypto.randomUUID()}`,
      templateId: template.id,
      createdAt: new Date().toISOString(),
      components: template.defaultComponents.map(c => ({ ...c, id: `comp-${crypto.randomUUID()}` })),
    };

    const invitations = await readData(invitationsPath);
    invitations.push(newInvitation);
    await writeData(invitationsPath, invitations);

    res.status(201).json(newInvitation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating invitation" });
  }
});

// Get a specific invitation by ID
app.get('/api/invitations/:id', async (req, res) => {
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

// Update an invitation (for saving layout, etc.)
app.put('/api/invitations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    let invitations = await readData(invitationsPath);
    const index = invitations.findIndex(inv => inv.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // Preserve original ID and creation date
    invitations[index] = {
        ...invitations[index],
        ...updatedData,
        id: invitations[index].id, // Ensure ID is not overwritten
        createdAt: invitations[index].createdAt // Ensure createdAt is not overwritten
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