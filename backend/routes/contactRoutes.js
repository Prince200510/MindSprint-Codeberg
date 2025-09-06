import express from 'express';
import { submitContactForm,  getContactInquiries,  updateContactStatus,  validateContactForm } from '../controllers/contactController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
router.post('/submit', validateContactForm, submitContactForm);
router.get('/', authenticateToken, authorizeRoles(['admin']), getContactInquiries);
router.put('/:contactId/status', authenticateToken, authorizeRoles(['admin']), updateContactStatus);

export default router;
