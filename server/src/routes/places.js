import { Router } from 'express';
import {
  nearbyHandler,
  placeByIdHandler,
  helplinesHandler
} from '../controllers/places.controller.js';
import { readLimiter } from '../middleware/security.js';

const router = Router();

router.use(readLimiter);

// GET /api/places/nearby?lat=&lng=&category=&radius=
router.get('/nearby', nearbyHandler);

// GET /api/places/helplines  — must be BEFORE /:id to avoid the param matching "helplines"
router.get('/helplines', helplinesHandler);

// GET /api/places/:id
router.get('/:id', placeByIdHandler);

export default router;

