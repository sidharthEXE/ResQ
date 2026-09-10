import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

export const contactSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(5, 'Phone number must be valid'),
  relationship: z.string().min(2, 'Relationship is required'),
});

export const donorRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  phone: z.string().min(5, 'Phone number must be valid'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const donorSearchSchema = z.object({
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(1).max(100).default(10),
});

export const donorAvailabilitySchema = z.object({
  availability: z.boolean(),
});
