/**
 * Validation schemas for the Places API.
 * Kept in one place so controllers never touch raw user input.
 */
import { z } from 'zod';

export const VALID_CATEGORIES = ['hospital', 'pharmacy', 'blood_bank', 'ambulance', 'all'];

export const nearbyQuerySchema = z.object({
  lat: z.coerce
    .number({ invalid_type_error: 'lat must be a number' })
    .finite('lat must be a finite number')
    .min(-90, 'lat must be >= -90')
    .max(90, 'lat must be <= 90'),

  lng: z.coerce
    .number({ invalid_type_error: 'lng must be a number' })
    .finite('lng must be a finite number')
    .min(-180, 'lng must be >= -180')
    .max(180, 'lng must be <= 180'),

  category: z.preprocess((val) => {
    if (!val || typeof val !== 'string') return 'all';
    const normalized = val.toLowerCase().trim();
    if (['pharmacies', 'pharmacy', 'chemist', 'chemists', 'drugstore', 'medical_store', 'dispensary'].includes(normalized)) return 'pharmacy';
    if (['hospitals', 'hospital', 'clinic', 'clinics', 'doctors', 'doctor'].includes(normalized)) return 'hospital';
    if (['blood-banks', 'blood-bank', 'bloodbanks', 'bloodbank', 'blood_bank'].includes(normalized)) return 'blood_bank';
    if (['ambulances', 'ambulance', 'ems'].includes(normalized)) return 'ambulance';
    if (['all', 'emergency', 'any'].includes(normalized)) return 'all';
    return normalized;
  }, z.enum(['hospital', 'pharmacy', 'blood_bank', 'ambulance', 'all'], {
    errorMap: () => ({
      message: `category must be one of: ${VALID_CATEGORIES.join(', ')}`
    })
  })).default('all'),

  radius: z.coerce
    .number({ invalid_type_error: 'radius must be a number' })
    .finite('radius must be a finite number')
    .min(100, 'radius must be >= 100 metres')
    .max(50000, 'radius must be <= 50 000 metres')
    .default(5000)
});

export const placeIdSchema = z.object({
  id: z
    .string({ required_error: 'id is required' })
    .trim()
    .min(1, 'id cannot be empty')
    .max(120, 'id is too long')
    .regex(/^[a-zA-Z0-9_\-]+$/, 'id contains invalid characters')
});

