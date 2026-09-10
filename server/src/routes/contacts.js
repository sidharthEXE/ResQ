import express from 'express';
import { createContact, getUserContacts } from '../controllers/contactController.js';

const router = express.Router();

router.post('/', createContact);
router.get('/user/:userId', getUserContacts);

export default router;
