/**
 * Places Service
 * All external API communication lives here.
 * Controllers never call third-party APIs directly.
 */
import NodeCache from 'node-cache';
import { fetchNearbyPlacesFromOSM } from './overpassService.js';
import { VERIFIED_EMERGENCY_NODES, EMERGENCY_HELPLINES } from '../data/fallbackEmergency.js';
import { calculateHaversineDistance } from '../utils/haversine.js';

// Cache results for 5 minutes to protect Overpass rate limits
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Returns nearby emergency places merged from live OSM data and
 * the local verified-nodes dataset.
 *
 * @param {{ lat: number, lng: number, category: string, radius: number }} params
 * @returns {Promise<{ places: object[], helplines: object, source: string }>}
 */
export async function getNearbyPlaces({ lat, lng, category, radius }) {
  // Round coordinates to ~1 km bucket for cache efficiency
  const cacheKey = `nearby_${lat.toFixed(2)}_${lng.toFixed(2)}_${category}_${radius}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return { places: cached, helplines: EMERGENCY_HELPLINES, source: 'cache' };
  }

  // Fetch from Overpass — throws on complete failure (all endpoints down)
  let osmPlaces = await fetchNearbyPlacesFromOSM(lat, lng, radius, category);

  // Auto-expand search radius if fewer than 5 facilities are found,
  // ensuring users in suburbs or sparse mapping areas never get stuck with only 0-2 results.
  if (osmPlaces.length < 5 && radius < 20000) {
    const expandedRadius = Math.min(Math.max(radius * 2, 12000), 25000);
    try {
      const expanded = await fetchNearbyPlacesFromOSM(lat, lng, expandedRadius, category);
      if (expanded.length > osmPlaces.length) {
        osmPlaces = expanded;
      }
    } catch (expErr) {
      console.warn('Auto-expansion query failed, using original results:', expErr.message);
    }
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
