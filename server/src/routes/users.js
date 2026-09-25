import express from 'express';
import { createUser, getUser } from '../controllers/userController.js';
import { readLimiter, mutationLimiter } from '../middleware/security.js';

const router = express.Router();

router.post('/', mutationLimiter, createUser);
router.get('/:id', readLimiter, getUser);

export default router;

