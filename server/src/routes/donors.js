import express from 'express';
import { registerDonor, searchDonors, updateAvailability } from '../controllers/donorController.js';

const router = express.Router();

router.post('/', registerDonor);
router.get('/', searchDonors);
router.get('/search', searchDonors);
router.patch('/:id/availability', updateAvailability);

export default router;
