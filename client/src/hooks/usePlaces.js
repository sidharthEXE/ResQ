import { useState, useEffect, useRef, useCallback } from 'react';

// In-memory client-side cache keyed by roundedLat_roundedLng_category_radius
const clientPlacesCache = new Map();

/**
 * Normalizes category IDs between UI representations and backend identifiers.
 */
export function normalizeCategory(category) {
  if (!category || category === 'all') return 'all';
  const c = category.toLowerCase().trim();
  if (c === 'hospitals' || c === 'hospital') return 'hospital';
  if (c === 'pharmacies' || c === 'pharmacy') return 'pharmacy';
  if (c === 'blood-banks' || c === 'blood_bank' || c === 'blood-bank' || c === 'bloodbanks') return 'blood_bank';
  if (c === 'ambulances' || c === 'ambulance') return 'ambulance';
  return c;
}

/**
 * Checks whether a place matches a given category identifier.
 */
export function matchesPlaceCategory(place, targetCategory) {
  const normTarget = normalizeCategory(targetCategory);
  if (normTarget === 'all') return true;
  const placeNorm = normalizeCategory(place.category);
  return placeNorm === normTarget;
}

export function usePlaces(location, category = 'all', radius = 10000) {
  const [data, setData] = useState([]);
  const [helplines, setHelplines] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  const fetchPlaces = useCallback(async (forceRefresh = false) => {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return;
    }

    const normCat = normalizeCategory(category);
    const bucketLat = location.lat.toFixed(2);
    const bucketLng = location.lng.toFixed(2);
    const cacheKey = `${bucketLat}_${bucketLng}_${normCat}_${radius}`;
    const allCacheKey = `${bucketLat}_${bucketLng}_all_${radius}`;

    // 1. Check direct cache first
    if (!forceRefresh && clientPlacesCache.has(cacheKey)) {
      const cached = clientPlacesCache.get(cacheKey);
      setData(cached.data);
      setHelplines(cached.helplines);
      setIsLoading(false);
      setError(null);
      return;
    }

    // 2. Cross-category instant hit:
    // If the 'all' dataset for this radius & location is already cached, filter locally in 0ms!
    if (!forceRefresh && normCat !== 'all' && clientPlacesCache.has(allCacheKey)) {
      const allCached = clientPlacesCache.get(allCacheKey);
      const filtered = allCached.data.filter((place) => matchesPlaceCategory(place, normCat));
      setData(filtered);
      setHelplines(allCached.helplines);
      setIsLoading(false);
      setError(null);
      // Store in specific category cache for future instant lookup
      clientPlacesCache.set(cacheKey, { data: filtered, helplines: allCached.helplines });
      return;
    }

    // 3. Need to fetch from API
    // Cancel any ongoing fetch to avoid race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Only show loading indicator if we don't have current data to prevent screen blanking
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        lat: location.lat,
        lng: location.lng,
        radius,
      });
      if (normCat !== 'all') {
        queryParams.append('category', normCat);
      }

      const response = await fetch(`/api/places/nearby?${queryParams.toString()}`, {
        signal: abortController.signal,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        const places = result.data || [];
        const lines = result.helplines || null;

        setData(places);
        setHelplines(lines);

        // Cache this exact request
        clientPlacesCache.set(cacheKey, { data: places, helplines: lines });

        // If this was an 'all' fetch, pre-seed individual category caches for instantaneous switching
        if (normCat === 'all') {
          for (const cat of ['hospital', 'pharmacy', 'blood_bank', 'ambulance']) {
            const subKey = `${bucketLat}_${bucketLng}_${cat}_${radius}`;
            const subPlaces = places.filter((p) => matchesPlaceCategory(p, cat));
            clientPlacesCache.set(subKey, { data: subPlaces, helplines: lines });
          }
        }
      } else {
        throw new Error(result.message || 'Failed to fetch places');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // Ignored: request was cleanly cancelled by a newer query
        return;
      }
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [location, category, radius]);

  useEffect(() => {
    fetchPlaces();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPlaces]);

  return { 
    data, 
    helplines, 
    isLoading, 
    error, 
    refetch: () => fetchPlaces(true) 
  };
}
