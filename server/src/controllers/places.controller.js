/**
 * Places Controller
 * Owns HTTP request/response logic only.
 * Business logic lives in the service layer.
 */
import { nearbyQuerySchema, placeIdSchema } from '../validators/places.validator.js';
import { getNearbyPlaces, getPlaceById, EMERGENCY_HELPLINES } from '../services/placesService.js';

/**
 * GET /api/places/nearby
 *
 * Query params: lat, lng, category, radius
 */
export async function nearbyHandler(req, res, next) {
  try {
    const parsed = nearbyQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid query parameters',
        errors: parsed.error.flatten().fieldErrors
      });
    }

    const { lat, lng, category, radius } = parsed.data;
    const result = await getNearbyPlaces({ lat, lng, category, radius });

    return res.json({
      status: 'success',
      source: result.source,
      count: result.places.length,
      helplines: result.helplines,
      data: result.places
    });
  } catch (err) {
    next(err); // pass to centralized error handler
  }
}

/**
 * GET /api/places/:id
 */
export function placeByIdHandler(req, res, next) {
  try {
    const parsed = placeIdSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid place ID',
        errors: parsed.error.flatten().fieldErrors
      });
    }

    const place = getPlaceById(parsed.data.id);

    if (!place) {
      return res.status(404).json({
        status: 'error',
        message: `No emergency place found with ID "${parsed.data.id}". Use /api/places/nearby to discover places first.`
      });
    }

    return res.json({
      status: 'success',
      helplines: EMERGENCY_HELPLINES,
      data: place
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/places/helplines
 */
export function helplinesHandler(_req, res) {
  res.json({ status: 'success', data: EMERGENCY_HELPLINES });
}
