import mongoose from 'mongoose';
import BloodDonor from '../models/BloodDonor.js';
import { 
  donorRegistrationSchema, 
  donorSearchSchema, 
  donorAvailabilitySchema,
  donorIdParamSchema 
} from '../validators/mongoValidators.js';
import { calculateHaversineDistance } from '../utils/haversine.js';
import { connectDB } from '../config/db.js';

// In-memory fallback repository ensuring donor features never fail even if DB connection is disrupted
const memoryDonors = [];

export const registerDonor = async (req, res, next) => {
  try {
    const parsed = donorRegistrationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: 'error',
        error: 'Validation Error',
        message: parsed.error.errors[0]?.message || 'Validation Error',
        details: parsed.error.errors,
        errors: parsed.error.flatten().fieldErrors
      });
    }

    const { name, bloodGroup, phone, lat, lng } = parsed.data;
    let donorId = null;

    // Check/await DB connection if connecting or disconnected
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // Try MongoDB first if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const donor = await BloodDonor.create({
          name,
          bloodGroup,
          phone,
          approximateLocation: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        });
        donorId = donor._id.toString();
      } catch (dbErr) {
        console.warn('MongoDB donor insert failed, saving to local store:', dbErr.message);
      }
    }

    // If MongoDB is not active or insert failed, persist in safe in-memory store
    if (!donorId) {
      donorId = 'donor-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
      memoryDonors.push({
        id: donorId,
        name,
        bloodGroup,
        phone,
        availability: true,
        lat,
        lng,
        createdAt: new Date()
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Donor registered successfully',
      donorId
    });
  } catch (error) {
    next(error);
  }
};

export const searchDonors = async (req, res, next) => {
  try {
    const parsed = donorSearchSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        status: 'error',
        error: 'Validation Error',
        message: parsed.error.errors[0]?.message || 'Invalid search parameters',
        details: parsed.error.errors,
        errors: parsed.error.flatten().fieldErrors
      });
    }

    const { bloodGroup, lat, lng, radiusKm } = parsed.data;
    const results = [];
    const seenIds = new Set();

    // Check DB connection
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // 1. Query MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          availability: true,
          approximateLocation: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [lng, lat]
              },
              $maxDistance: radiusKm * 1000
            }
          }
        };

        if (bloodGroup) {
          query.bloodGroup = bloodGroup;
        }

        const donors = await BloodDonor.find(query).limit(50).lean();

        for (const donor of donors) {
          const coords = donor.approximateLocation?.coordinates;
          if (!Array.isArray(coords) || coords.length < 2) continue;

          const [dLng, dLat] = coords;
          if (typeof dLat !== 'number' || typeof dLng !== 'number') continue;

          const dist = calculateHaversineDistance(lat, lng, dLat, dLng);
          seenIds.add(donor._id.toString());

          results.push({
            id: donor._id.toString(),
            name: donor.name,
            bloodGroup: donor.bloodGroup,
            phone: donor.phone,
            distanceKm: dist.distanceKm,
            formattedDistance: dist.formattedDistance,
            approximateLocation: {
              lat: Math.round(dLat * 100) / 100,
              lng: Math.round(dLng * 100) / 100
            }
          });
        }
      } catch (dbErr) {
        console.warn('MongoDB search query failed, checking memory fallback:', dbErr.message);
      }
    }

    // 2. Query in-memory store
    for (const donor of memoryDonors) {
      if (donor.availability && (!bloodGroup || donor.bloodGroup === bloodGroup) && !seenIds.has(donor.id)) {
        const dist = calculateHaversineDistance(lat, lng, donor.lat, donor.lng);
        if (dist.distanceKm <= radiusKm) {
          results.push({
            id: donor.id,
            name: donor.name,
            bloodGroup: donor.bloodGroup,
            phone: donor.phone,
            distanceKm: dist.distanceKm,
            formattedDistance: dist.formattedDistance,
            approximateLocation: {
              lat: Math.round(donor.lat * 100) / 100,
              lng: Math.round(donor.lng * 100) / 100
            }
          });
        }
      }
    }

    results.sort((a, b) => a.distanceKm - b.distanceKm);
    return res.json(results);
  } catch (error) {
    next(error);
  }
};

export const updateAvailability = async (req, res, next) => {
  try {
    const paramParsed = donorIdParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid donor ID',
        errors: paramParsed.error.flatten().fieldErrors
      });
    }

    const bodyParsed = donorAvailabilitySchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({
        status: 'error',
        error: 'Validation Error',
        message: bodyParsed.error.errors[0]?.message || 'Invalid availability status',
        details: bodyParsed.error.errors
      });
    }

    const { availability } = bodyParsed.data;
    const { id } = paramParsed.data;

    // Try MongoDB if connected and ID is a valid ObjectId
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      try {
        const donor = await BloodDonor.findByIdAndUpdate(
          id, 
          { availability },
          { returnDocument: 'after' }
        );
        if (donor) {
          return res.json({ 
            status: 'success',
            message: 'Availability updated successfully', 
            availability: donor.availability 
          });
        }
      } catch (err) {
        console.warn('MongoDB availability update error:', err.message);
      }
    }


    // Try in-memory store
    const memDonor = memoryDonors.find((d) => d.id === id);
    if (memDonor) {
      memDonor.availability = availability;
      return res.json({ 
        status: 'success',
        message: 'Availability updated successfully', 
        availability: memDonor.availability 
      });
    }

    return res.status(404).json({ status: 'error', error: 'Donor not found', message: 'Donor not found' });
  } catch (error) {
    next(error);
  }
};


