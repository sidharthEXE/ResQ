import express from 'express';
import { registerDonor, searchDonors, updateAvailability } from '../controllers/donorController.js';
import { readLimiter, mutationLimiter } from '../middleware/security.js';

const router = express.Router();

router.post('/', mutationLimiter, registerDonor);
router.get('/', readLimiter, searchDonors);
router.get('/search', readLimiter, searchDonors);
router.patch('/:id/availability', mutationLimiter, updateAvailability);

export default router;

