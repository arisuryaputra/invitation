import { Request, Response } from 'express';
import * as invitationService from '../services/invitation.service';

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await invitationService.getTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching templates' });
  }
};

export const createInvitation = async (req: Request, res: Response) => {
  try {
    const { templateId, components } = req.body;
    const newInvitation = await invitationService.createNewInvitation(templateId, components);
    res.status(201).json(newInvitation);
  } catch (error: any) {
    console.error(error);
    if (error.message === 'Template not found') {
        return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating invitation' });
  }
};

export const getInvitation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invitation = await invitationService.getInvitationById(id);
    if (invitation) {
      res.json(invitation);
    } else {
      res.status(404).json({ message: 'Invitation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invitation' });
  }
};

export const updateInvitation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedInvitation = await invitationService.updateInvitationById(id, updatedData);

    if (updatedInvitation) {
      res.json(updatedInvitation);
    } else {
      res.status(404).json({ message: 'Invitation not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating invitation' });
  }
};