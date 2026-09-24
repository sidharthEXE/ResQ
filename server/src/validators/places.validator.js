/**
 * Validation schemas for the Places API.
 * Kept in one place so controllers never touch raw user input.
 */
import { z } from 'zod';

export const VALID_CATEGORIES = ['hospital', 'pharmacy', 'blood_bank', 'ambulance', 'all'];

export const nearbyQuerySchema = z.object({
  lat: z.coerce
    .number({ invalid_type_error: 'lat must be a number' })
    .min(-90, 'lat must be >= -90')
    .max(90, 'lat must be <= 90'),

  lng: z.coerce
    .number({ invalid_type_error: 'lng must be a number' })
    .min(-180, 'lng must be >= -180')
    .max(180, 'lng must be <= 180'),

  category: z.preprocess((val) => {
    if (!val || typeof val !== 'string') return 'all';
    const normalized = val.toLowerCase().trim();
    if (normalized === 'pharmacies') return 'pharmacy';
    if (normalized === 'hospitals') return 'hospital';
    if (normalized === 'blood-banks' || normalized === 'blood-bank' || normalized === 'bloodbanks' || normalized === 'bloodbank') return 'blood_bank';
    if (normalized === 'ambulances') return 'ambulance';
    return normalized;
  }, z.enum(['hospital', 'pharmacy', 'blood_bank', 'ambulance', 'all'], {
    errorMap: () => ({
      message: `category must be one of: ${VALID_CATEGORIES.join(', ')}`
    })
  })).default('all'),

  radius: z.coerce
    .number({ invalid_type_error: 'radius must be a number' })
    .min(100, 'radius must be >= 100 metres')
    .max(50000, 'radius must be <= 50 000 metres')
    .default(5000)
});

export const placeIdSchema = z.object({
  id: z
    .string()
    .min(1, 'id cannot be empty')
    .max(120, 'id is too long')
    .regex(/^[a-zA-Z0-9_\-]+$/, 'id contains invalid characters')
});
