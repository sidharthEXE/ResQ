/**
 * Places Service
 * All external API communication lives here.
 * Controllers never call third-party APIs directly.
 */
import NodeCache from 'node-cache';
import { fetchNearbyPlacesFromOSM } from './overpassService.js';
import { VERIFIED_EMERGENCY_NODES, EMERGENCY_HELPLINES } from '../data/fallbackEmergency.js';
import { calculateHaversineDistance } from '../utils/haversine.js';

// Cache results for 1 hour to protect Overpass and deliver sub-millisecond responses
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

/**
 * Returns nearby emergency places merged from live OSM data and
 * the local verified-nodes dataset.
 *
 * @param {{ lat: number, lng: number, category: string, radius: number }} params
 * @returns {Promise<{ places: object[], helplines: object, source: string }>}
 */
export async function getNearbyPlaces({ lat, lng, category, radius }) {
  const roundedLat = lat.toFixed(2);
  const roundedLng = lng.toFixed(2);

  // Exact cache key check
  const cacheKey = `nearby_${roundedLat}_${roundedLng}_${category}_${radius}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return { places: cached, helplines: EMERGENCY_HELPLINES, source: 'cache' };
  }

  // Cross-category cache optimization:
  // If the 'all' category was already fetched for this area and covers this radius,
  // filter it immediately without hitting external Overpass API!
  if (category !== 'all') {
    const allCacheKey = `nearby_${roundedLat}_${roundedLng}_all_${radius}`;
    const allCached = cache.get(allCacheKey);
    if (allCached) {
      const filtered = allCached.filter((p) => {
        if (category === 'hospital') return p.category === 'hospital' || p.category === 'hospitals';
        if (category === 'pharmacy') return p.category === 'pharmacy' || p.category === 'pharmacies';
        if (category === 'blood_bank') return p.category === 'blood_bank' || p.category === 'blood-banks';
        if (category === 'ambulance') return p.category === 'ambulance' || p.category === 'ambulances';
        return p.category === category;
      });
      cache.set(cacheKey, filtered);
      return { places: filtered, helplines: EMERGENCY_HELPLINES, source: 'cache' };
    }
  }

  // Fetch from fast Overpass mirrors concurrently
  let osmPlaces = [];
  try {
    osmPlaces = await fetchNearbyPlacesFromOSM(lat, lng, radius, category);
  } catch (err) {
    console.warn('Overpass fetch failed, falling back to verified local emergency nodes:', err.message);
  }

  // Determine effective coverage radius for verified local nodes
  const maxDistanceMeters = osmPlaces.length > 0 
    ? Math.max(...osmPlaces.map((p) => p.distanceMeters || 0), radius)
    : radius;

  // Merge in verified local nodes that fall within the effective radius
  const verifiedNearby = VERIFIED_EMERGENCY_NODES
    .filter((node) => {
      const matchesCategory = category === 'all' || node.category === category;
      if (!matchesCategory) return false;
      const { distanceMeters } = calculateHaversineDistance(lat, lng, node.lat, node.lng);
      return distanceMeters <= maxDistanceMeters;
    })
    .map((node) => {
      const dist = calculateHaversineDistance(lat, lng, node.lat, node.lng);
      return { ...node, ...dist, hasDirectPhone: Boolean(node.phone) };
    });

  // Deduplicate and sort by closest distance
  const seenIds = new Set();
  const combined = [];
  for (const place of [...verifiedNearby, ...osmPlaces]) {
    if (!seenIds.has(place.id)) {
      seenIds.add(place.id);
      combined.push(place);
    }
  }
  combined.sort((a, b) => a.distanceKm - b.distanceKm);

  cache.set(cacheKey, combined);
  return { places: combined, helplines: EMERGENCY_HELPLINES, source: 'live' };
}

/**
 * Looks up a single place by its ID.
 * Searches verified nodes first, then can be extended to query OSM by ID.
 *
 * @param {string} id
 * @returns {object|null}
 */
export function getPlaceById(id) {
  // 1. Check verified local nodes
  const verified = VERIFIED_EMERGENCY_NODES.find((n) => n.id === id);
  if (verified) return { ...verified, source: 'verified' };

  // 2. OSM IDs are not individually queryable without re-fetching context,
  //    so we check the in-memory cache for any prior nearby response that
  //    contains this OSM element.
  const keys = cache.keys();
  for (const key of keys) {
    const places = cache.get(key);
    if (Array.isArray(places)) {
      const found = places.find((p) => p.id === id);
      if (found) return { ...found, source: 'cache' };
    }
  }

  return null;
}

export { EMERGENCY_HELPLINES };
