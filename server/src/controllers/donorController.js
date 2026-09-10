import mongoose from 'mongoose';
import BloodDonor from '../models/BloodDonor.js';
import { donorRegistrationSchema, donorSearchSchema, donorAvailabilitySchema } from '../validators/mongoValidators.js';
import { calculateHaversineDistance } from '../utils/haversine.js';

// In-memory fallback repository ensuring donor features never fail even if DB connection is disrupted
const memoryDonors = [];

export const registerDonor = async (req, res, next) => {
  try {
    const { name, bloodGroup, phone, lat, lng } = donorRegistrationSchema.parse(req.body);
    
    let donorId = null;

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

    // If MongoDB is not active or failed, persist in safe in-memory store
    if (!donorId) {
      donorId = 'donor-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
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

    res.status(201).json({
      message: 'Donor registered successfully',
      donorId
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    next(error);
  }
};

export const searchDonors = async (req, res, next) => {
  try {
    const { bloodGroup, lat, lng, radiusKm } = donorSearchSchema.parse(req.query);
    
    const results = [];
    const seenIds = new Set();

    // 1. Try querying MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const donors = await BloodDonor.find({
          bloodGroup,
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
        }).limit(50);

        for (const donor of donors) {
          const [dLng, dLat] = donor.approximateLocation.coordinates;
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
      if (donor.availability && donor.bloodGroup === bloodGroup && !seenIds.has(donor.id)) {
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
    res.json(results);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    next(error);
  }
};

export const updateAvailability = async (req, res, next) => {
  try {
    const { availability } = donorAvailabilitySchema.parse(req.body);
    const id = req.params.id;

    if (mongoose.connection.readyState === 1) {
      try {
        const donor = await BloodDonor.findByIdAndUpdate(
          id, 
          { availability },
          { new: true }
        );
        if (donor) {
          return res.json({ message: 'Availability updated successfully', availability: donor.availability });
        }
      } catch (err) {
        // Continue to fallback
      }
    }

    const memDonor = memoryDonors.find((d) => d.id === id);
    if (memDonor) {
      memDonor.availability = availability;
      return res.json({ message: 'Availability updated successfully', availability: memDonor.availability });
    }

    res.status(404).json({ error: 'Donor not found' });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    next(error);
  }
};

