import { useState, useEffect } from 'react';

export function usePlaces(location, category, radius) {
  const [data, setData] = useState([]);
  const [helplines, setHelplines] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlaces = async () => {
    // We need location to fetch. Default or exact.
    if (!location) return;

    setIsLoading(true);
    setError(null);

    try {
      const { lat, lng } = location;
      const apiCategory = category === 'all' ? '' : category;
      // Note: mapping 'blood-banks' to 'blood_bank' and 'ambulances' to 'ambulance'
      // to match backend API format, though API might handle it.
      let normalizedCategory = apiCategory;
      if (normalizedCategory === 'blood-banks') normalizedCategory = 'blood_bank';
      if (normalizedCategory === 'ambulances') normalizedCategory = 'ambulance';
      if (normalizedCategory === 'hospitals') normalizedCategory = 'hospital';
      if (normalizedCategory === 'pharmacies') normalizedCategory = 'pharmacy';

      const queryParams = new URLSearchParams({
        lat,
        lng,
        radius,
      });
      if (normalizedCategory) {
        queryParams.append('category', normalizedCategory);
      }

      const response = await fetch(`/api/places/nearby?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        setData(result.data);
        setHelplines(result.helplines);
      } else {
        throw new Error(result.message || 'Failed to fetch places');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [location?.lat, location?.lng, category, radius]);

  return { data, helplines, isLoading, error, refetch: fetchPlaces };
}
