/**
 * Places Service
 * All external API communication lives here.
 * Controllers never call third-party APIs directly.
 */
import NodeCache from 'node-cache';
import { fetchNearbyPlacesFromOSM, fetchOSMElementById } from './overpassService.js';
import { VERIFIED_EMERGENCY_NODES, EMERGENCY_HELPLINES } from '../data/fallbackEmergency.js';
import { calculateHaversineDistance } from '../utils/haversine.js';

// Cache query results for 1 hour to protect Overpass and deliver sub-millisecond responses
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
// Cache individual places by ID for 2 hours for fast detail views
const placeCache = new NodeCache({ stdTTL: 7200, checkperiod: 300 });

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

  // Merge in verified local nodes that strictly fall within the user radius
  const verifiedNearby = VERIFIED_EMERGENCY_NODES
    .filter((node) => category === 'all' || node.category === category)
    .map((node) => {
      const dist = calculateHaversineDistance(lat, lng, node.lat, node.lng);
      return { ...node, ...dist, hasDirectPhone: Boolean(node.phone) };
    })
    .filter((node) => node.distanceMeters <= radius);

  // Deduplicate and sort by closest distance
  const seenIds = new Set();
  const combined = [];
  for (const place of [...verifiedNearby, ...osmPlaces]) {
    if (!seenIds.has(place.id)) {
      seenIds.add(place.id);
      combined.push(place);
      // Index in placeCache for instantaneous O(1) single-place lookups
      placeCache.set(place.id, place);
    }
  }
  combined.sort((a, b) => a.distanceKm - b.distanceKm);

  cache.set(cacheKey, combined);
  return { places: combined, helplines: EMERGENCY_HELPLINES, source: 'live' };
}

/**
 * Looks up a single place by its ID.
 * Searches verified nodes, in-memory place cache, query cache,
 * and falls back to live OSM element lookup by ID if un-cached.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function getPlaceById(id) {
  if (!id) return null;

  // 1. Check verified local nodes
  const verified = VERIFIED_EMERGENCY_NODES.find((n) => n.id === id);
  if (verified) return { ...verified, source: 'verified' };

  // 2. Check dedicated placeCache
  const cachedPlace = placeCache.get(id);
  if (cachedPlace) return { ...cachedPlace, source: 'cache' };

  // 3. Check query cache
  const keys = cache.keys();
  for (const key of keys) {
    const places = cache.get(key);
    if (Array.isArray(places)) {
      const found = places.find((p) => p.id === id);
      if (found) {
        placeCache.set(id, found);
        return { ...found, source: 'cache' };
      }
    }
  }

  // 4. Live fallback for OSM elements (osm-node-123, osm-way-456, osm-relation-789)
  const match = id.match(/^osm-(node|way|relation)-(\d+)$/);
  if (match) {
    const [, type, elementId] = match;
    try {
      const liveOsmPlace = await fetchOSMElementById(type, elementId);
      if (liveOsmPlace) {
        placeCache.set(id, liveOsmPlace);
        return { ...liveOsmPlace, source: 'live' };
      }
    } catch (err) {
      console.warn(`Failed live OSM lookup for ${id}:`, err.message);
    }
  }

  return null;
}

export { EMERGENCY_HELPLINES };

