import { useState, useEffect, useCallback } from 'react';

export function usePlaceDetails(id) {
  const [place, setPlace] = useState(null);
  const [helplines, setHelplines] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlace = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/places/${id}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        setPlace(result.data);
        setHelplines(result.helplines);
      } else {
        throw new Error(result.message || 'Failed to fetch place details');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setPlace(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlace();
  }, [fetchPlace]);

  return { place, helplines, isLoading, error, refetch: fetchPlace };
}
