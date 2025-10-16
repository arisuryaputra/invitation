import { Router } from 'express';
import {
  getTemplates,
  createInvitation,
  getInvitation,
  updateInvitation,
} from '../controllers/invitation.controller';

const router = Router();

// Route for templates
router.get('/templates', getTemplates);

// Routes for invitations
router.post('/invitations', createInvitation);
router.get('/invitations/:id', getInvitation);
router.put('/invitations/:id', updateInvitation);

export default router;