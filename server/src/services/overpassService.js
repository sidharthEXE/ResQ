import { calculateHaversineDistance } from '../utils/haversine.js';
import { EMERGENCY_HELPLINES } from '../data/fallbackEmergency.js';

const OVERPASS_ENDPOINTS = [
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

/**
 * Builds Overpass QL query string using clean indexed OSM key filters.
 * Avoids unindexed wildcard scans to ensure sub-second response times from OSM mirrors.
 */
function buildOverpassQuery(lat, lng, radiusMeters, category) {
  let amenityFilters = [];

  switch (category) {
    case 'hospital':
      amenityFilters = [
        'node["amenity"="hospital"]',
        'way["amenity"="hospital"]',
        'node["amenity"="clinic"]',
        'way["amenity"="clinic"]',
        'node["healthcare"="hospital"]',
        'way["healthcare"="hospital"]',
        'node["healthcare"="clinic"]',
        'way["healthcare"="clinic"]',
        'node["amenity"="doctors"]',
        'way["amenity"="doctors"]',
        'node["healthcare"="centre"]',
        'way["healthcare"="centre"]'
      ];
      break;

    case 'pharmacy':
      amenityFilters = [
        'node["amenity"="pharmacy"]',
        'way["amenity"="pharmacy"]',
        'node["healthcare"="pharmacy"]',
        'way["healthcare"="pharmacy"]',
        'node["shop"="chemist"]',
        'way["shop"="chemist"]',
        'node["shop"="pharmacy"]',
        'way["shop"="pharmacy"]',
        'node["shop"="medical_store"]',
        'way["shop"="medical_store"]',
        'node["shop"="medical"]',
        'way["shop"="medical"]',
        'node["shop"="medicine"]',
        'way["shop"="medicine"]',
        'node["shop"="medical_supply"]',
        'way["shop"="medical_supply"]',
        'node["shop"="drugstore"]',
        'way["shop"="drugstore"]',
        'node["amenity"="dispensary"]',
        'way["amenity"="dispensary"]',
        'node["healthcare"="dispensary"]',
        'way["healthcare"="dispensary"]',
        'node["amenity"="chemist"]',
        'way["amenity"="chemist"]',
        'node["healthcare"="chemist"]',
        'way["healthcare"="chemist"]',
        'node["dispensing"="yes"]',
        'way["dispensing"="yes"]'
      ];
      break;

    case 'blood_bank':
      amenityFilters = [
        'node["healthcare"="blood_bank"]',
        'way["healthcare"="blood_bank"]',
        'node["amenity"="blood_bank"]',
        'way["amenity"="blood_bank"]',
        'node["blood_bank"]',
        'way["blood_bank"]'
      ];
      break;

    case 'ambulance':
      amenityFilters = [
        'node["emergency"="ambulance_station"]',
        'way["emergency"="ambulance_station"]',
        'node["amenity"="ambulance_station"]',
        'way["amenity"="ambulance_station"]',
        'node["emergency"="ambulance"]',
        'way["emergency"="ambulance"]'
      ];
      break;

    default: // all / emergency services
      amenityFilters = [
        'node["amenity"="hospital"]',
        'way["amenity"="hospital"]',
        'node["amenity"="clinic"]',
        'way["amenity"="clinic"]',
        'node["healthcare"="hospital"]',
        'node["amenity"="pharmacy"]',
        'way["amenity"="pharmacy"]',
        'node["shop"="chemist"]',
        'way["shop"="chemist"]',
        'node["shop"="pharmacy"]',
        'way["shop"="pharmacy"]',
        'node["shop"="medical"]',
        'node["healthcare"="pharmacy"]',
        'node["healthcare"="blood_bank"]',
        'way["healthcare"="blood_bank"]',
        'node["emergency"="ambulance_station"]',
        'way["emergency"="ambulance_station"]'
      ];
      break;
  }

  const queryParts = amenityFilters
    .map((filter) => `${filter}(around:${radiusMeters},${lat},${lng});`)
    .join('\n');

  return `[out:json][timeout:15];
(
${queryParts}
);
out center body;`;
}

/**
 * Individual endpoint fetcher with proper headers and timeout.
 */
async function fetchFromSingleEndpoint(endpoint, query, timeoutMs = 8000) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': 'ResQEmergencyApp/2.0 (contact: support@resq-emergency.org)',
      'Accept': 'application/json, */*'
    },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${endpoint}`);
  }

  const data = await response.json();
  if (!data || !Array.isArray(data.elements)) {
    throw new Error(`Invalid JSON payload from ${endpoint}`);
  }

  return data;
}

/**
 * Normalizes a raw OSM element into our standardized emergency Place schema.
 */
export function formatOSMElement(elem, refLat = null, refLng = null, defaultCategory = 'hospital') {
  if (!elem) return null;

  const elemLat = elem.lat ?? (elem.center && elem.center.lat);
  const elemLng = elem.lon ?? (elem.center && elem.center.lon);

  if (typeof elemLat !== 'number' || typeof elemLng !== 'number' || isNaN(elemLat) || isNaN(elemLng)) {
    return null;
  }

  const tags = elem.tags || {};
  const uniqueId = `osm-${elem.type || 'node'}-${elem.id}`;

  let dist = { distanceKm: 0, distanceMeters: 0, formattedDistance: '0 m' };
  if (refLat !== null && refLng !== null) {
    dist = calculateHaversineDistance(refLat, refLng, elemLat, elemLng);
  }

  // Raw contact extraction
  const rawPhone =
    tags.phone ||
    tags['contact:phone'] ||
    tags['emergency:phone'] ||
    tags.telephone ||
    tags['contact:telephone'] ||
    tags['contact:mobile'] ||
    null;

  // Standardized place category tag
  let placeCategory = defaultCategory === 'all' ? 'hospital' : defaultCategory;
  if (
    tags.amenity === 'pharmacy' ||
    tags.healthcare === 'pharmacy' ||
    tags.shop === 'chemist' ||
    tags.shop === 'pharmacy' ||
    tags.shop === 'medical' ||
    tags.shop === 'medical_store' ||
    tags.shop === 'medicine' ||
    tags.shop === 'medical_supply' ||
    tags.shop === 'drugstore' ||
    tags.amenity === 'dispensary' ||
    tags.healthcare === 'dispensary' ||
    tags.amenity === 'chemist' ||
    tags.healthcare === 'chemist' ||
    tags.dispensing === 'yes' ||
    (tags.name && /pharmacy|chemist|medical|medicos|druggist|drug store|aushadhi|dawakhana|medicine/i.test(tags.name))
  ) {
    placeCategory = 'pharmacy';
  } else if (
    tags.amenity === 'hospital' ||
    tags.healthcare === 'hospital' ||
    tags.amenity === 'clinic' ||
    tags.healthcare === 'clinic' ||
    tags.amenity === 'doctors' ||
    tags.healthcare === 'centre'
  ) {
    placeCategory = 'hospital';
  } else if (
    tags.healthcare === 'blood_bank' ||
    tags.amenity === 'blood_bank' ||
    tags.blood_bank ||
    (tags.name && /blood|red cross/i.test(tags.name))
  ) {
    placeCategory = 'blood_bank';
  } else if (
    tags.emergency === 'ambulance_station' ||
    tags.emergency === 'ambulance' ||
    tags.amenity === 'ambulance_station' ||
    (tags.name && /ambulance|ems/i.test(tags.name))
  ) {
    placeCategory = 'ambulance';
  }

  // Address construction from OSM tags
  const street = tags['addr:street'] || tags['addr:full'] || tags['addr:housenumber'] || '';
  const city = tags['addr:city'] || tags['addr:suburb'] || tags['addr:town'] || tags['addr:district'] || '';
  const postcode = tags['addr:postcode'] || '';
  let formattedAddress = [street, city, postcode].filter(Boolean).join(', ');

  if (!formattedAddress) {
    formattedAddress = tags.operator || tags.brand || 'Address details available on map navigation';
  }

  const rawName = tags.name || tags['name:en'] || tags.brand || tags.operator;
  const name =
    rawName ||
    (placeCategory === 'pharmacy'
      ? 'Local Pharmacy & Medical Store'
      : `${placeCategory.replace('_', ' ').toUpperCase()} Service`);

  return {
    id: uniqueId,
    osmId: elem.id,
    name,
    category: placeCategory,
    lat: elemLat,
    lng: elemLng,
    address: formattedAddress,
    phone: rawPhone,
    hasDirectPhone: Boolean(rawPhone),
    emergencyHelpline: EMERGENCY_HELPLINES.national.universal,
    distanceKm: dist.distanceKm,
    distanceMeters: dist.distanceMeters,
    formattedDistance: dist.formattedDistance,
    openingHours: tags.opening_hours || (tags['24/7'] === 'yes' ? '24/7 Open' : 'Contact for operational hours'),
    is24x7: tags.opening_hours === '24/7' || tags['24/7'] === 'yes' || tags.amenity === 'hospital',
    wheelchair: tags.wheelchair || 'unknown',
    website: tags.website || tags['contact:website'] || null,
    isVerified: false
  };
}

/**
 * Fetches a single OSM element by ID (e.g. node, way, relation) via Overpass query.
 */
export async function fetchOSMElementById(type, elementId, refLat = null, refLng = null) {
  const cleanType = ['node', 'way', 'relation'].includes(type) ? type : 'node';
  const query = `[out:json][timeout:8];(${cleanType}(${elementId}););out center body;`;

  let responseData = null;
  try {
    responseData = await Promise.any(
      OVERPASS_ENDPOINTS.map((endpoint) => fetchFromSingleEndpoint(endpoint, query, 6000))
    );
  } catch (err) {
    console.warn(`Direct OSM lookup for ${cleanType}/${elementId} failed:`, err.message);
    return null;
  }

  if (!responseData?.elements?.length) return null;
  return formatOSMElement(responseData.elements[0], refLat, refLng);
}

/**
 * Fetches nearby emergency places from OpenStreetMap Overpass API using fast mirror racing.
 */
export async function fetchNearbyPlacesFromOSM(lat, lng, radiusMeters, category) {
  const query = buildOverpassQuery(lat, lng, radiusMeters, category);

  let responseData = null;

  try {
    // Race all fast mirrors concurrently — the fastest valid response wins!
    responseData = await Promise.any(
      OVERPASS_ENDPOINTS.map((endpoint) => fetchFromSingleEndpoint(endpoint, query, 8000))
    );
  } catch (raceErr) {
    console.warn('Fast mirror race failed or timed out:', raceErr.message);
  }

  if (!responseData || !responseData.elements) {
    return [];
  }

  const seenIds = new Set();
  const results = [];

  for (const elem of responseData.elements) {
    const formatted = formatOSMElement(elem, lat, lng, category);
    if (!formatted) continue;

    if (seenIds.has(formatted.id)) continue;
    seenIds.add(formatted.id);

    results.push(formatted);
  }

  // Sort by closest distance first
  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}



