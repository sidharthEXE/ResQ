/**
 * Places Router
 * Only wires URL paths to controller functions.
 * No business logic lives here.
 */
import { Router } from 'express';
import {
  nearbyHandler,
  placeByIdHandler,
  helplinesHandler
} from '../controllers/places.controller.js';

const router = Router();

// GET /api/places/nearby?lat=&lng=&category=&radius=
router.get('/nearby', nearbyHandler);

// GET /api/places/helplines  — must be BEFORE /:id to avoid the param matching "helplines"
router.get('/helplines', helplinesHandler);

// GET /api/places/:id
router.get('/:id', placeByIdHandler);

export default router;
