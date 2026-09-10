import React, { createContext, useContext, useState, useCallback } from 'react';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null); // { lat, lng, accuracy, timestamp }
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null); // { code, message, type }

  const requestLocation = useCallback(() => {
    setIsLoading(true);
    setErrorStatus(null);

    if (!navigator.geolocation) {
      setIsLoading(false);
      setErrorStatus({
        code: 0,
        type: 'UNSUPPORTED',
        message: 'Browser Geolocation is not supported by your device.'
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 0 // Always request fresh coordinates
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({
          lat: latitude,
          lng: longitude,
          accuracy: accuracy ? Math.round(accuracy) : null,
          timestamp: new Date(position.timestamp).toLocaleTimeString()
        });
        setIsLoading(false);
        setErrorStatus(null);
      },
      (error) => {
        setIsLoading(false);
        let errorType = 'UNKNOWN';
        let errorMessage = 'An unexpected error occurred while fetching location.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorType = 'PERMISSION_DENIED';
            errorMessage = 'Location access denied. Please allow location permissions in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorType = 'POSITION_UNAVAILABLE';
            errorMessage = 'Location position is currently unavailable from your device GPS.';
            break;
          case error.TIMEOUT:
            errorType = 'TIMEOUT';
            errorMessage = 'Location request timed out. Please check your GPS signal and try again.';
            break;
          default:
            break;
        }

        setErrorStatus({
          code: error.code,
          type: errorType,
          message: errorMessage
        });
      },
      options
    );
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setErrorStatus(null);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        isLoading,
        errorStatus,
        requestLocation,
        clearLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
