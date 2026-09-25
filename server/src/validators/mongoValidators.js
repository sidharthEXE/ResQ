import { z } from 'zod';

export const objectIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format: must be a 24-character hexadecimal ObjectId')
});

export const userIdParamSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format: must be a 24-character hexadecimal ObjectId')
});

export const donorIdParamSchema = z.object({
  id: z.string().trim().min(1, 'Donor ID cannot be empty').max(100, 'Donor ID is too long').regex(/^[a-zA-Z0-9_\-]+$/, 'Invalid donor ID format')
});

export const userSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email cannot exceed 255 characters').toLowerCase(),
});

export const contactSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  phone: z
    .string()
    .trim()
    .min(5, 'Phone number must be at least 5 digits')
    .max(20, 'Phone number cannot exceed 20 characters')
    .regex(/^[+0-9\s\-()]+$/, 'Phone number contains invalid characters'),
  relationship: z.string().trim().min(2, 'Relationship is required').max(50, 'Relationship cannot exceed 50 characters'),
});

const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function normalizeBloodGroup(val) {
  if (!val || typeof val !== 'string') return undefined;
  let s = val.trim().toUpperCase();
  if (s === 'ALL' || s === '') return undefined;
  // If URL query string decoded '+' as a space (e.g. 'O ', 'AB ')
  if (val.includes(' ') && !s.includes('+') && !s.includes('-')) {
    s += '+';
  }
  return s;
}

export const donorRegistrationSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  bloodGroup: z.preprocess(
    (val) => normalizeBloodGroup(val),
    z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
      errorMap: () => ({ message: `Blood group must be one of: ${VALID_BLOOD_GROUPS.join(', ')}` })
    })
  ),
  phone: z
    .string()
    .trim()
    .min(5, 'Phone number must be at least 5 digits')
    .max(20, 'Phone number cannot exceed 20 characters')
    .regex(/^[+0-9\s\-()]+$/, 'Phone number contains invalid characters'),
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
});

export const donorSearchSchema = z.object({
  bloodGroup: z.preprocess(
    (val) => normalizeBloodGroup(val),
    z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional()
  ),
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
  radiusKm: z.coerce

    .number({ invalid_type_error: 'radiusKm must be a number' })
    .finite('radiusKm must be a finite number')
    .min(1, 'radiusKm must be at least 1 km')
    .max(100, 'radiusKm cannot exceed 100 km')
    .default(10),
});

export const donorAvailabilitySchema = z.object({
  availability: z.boolean({
    required_error: 'availability is required',
    invalid_type_error: 'availability must be a boolean'
  }),
});

