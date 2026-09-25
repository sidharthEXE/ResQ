import express from 'express';
import { createContact, getUserContacts } from '../controllers/contactController.js';
import { readLimiter, mutationLimiter } from '../middleware/security.js';

const router = express.Router();

router.post('/', mutationLimiter, createContact);
router.get('/user/:userId', readLimiter, getUserContacts);

export default router;

