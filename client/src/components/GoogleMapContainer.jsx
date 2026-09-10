import React, { useState, useEffect } from 'react';
import { APIProvider, Map, Marker, Pin } from '@vis.gl/react-google-maps';
import { useLocation } from '../context/LocationContext';
import LeafletMapContainer from './MapContainer';
import { Layers, Search, Loader2 } from 'lucide-react';

export default function GoogleMapContainer({
  center,
  zoom = 14,
  places = [],
  selectedPlace,
  onSelectPlace,
  onSearchArea,
  isSearching = false,
  className = ''
}) {
  const { location } = useLocation();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'EMERGENCY_FINDER_MAP';
  const [loadError, setLoadError] = useState(false);
  const [useOpenSourceFallback, setUseOpenSourceFallback] = useState(!apiKey);

  // Determine current map center: Selected Place -> User Location -> Passed Center -> Default Coordinates (Delhi)
  const defaultPosition = React.useMemo(() => {
    return center
      ? { lat: center.lat, lng: center.lng }
      : location
      ? { lat: location.lat, lng: location.lng }
      : { lat: 28.6139, lng: 77.2090 };
  }, [center?.lat, center?.lng, location?.lat, location?.lng]);

  const [mapCenter, setMapCenter] = useState(defaultPosition);

  // Fallback to open-source Leaflet map if API key is missing or load error occurred or user selected fallback
  if (useOpenSourceFallback || loadError || !apiKey) {
    return (
      <div className="relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-xs transition-colors duration-150">
        <LeafletMapContainer
          places={places}
          selectedPlace={selectedPlace}
          onSelectPlace={onSelectPlace}
          center={defaultPosition}
          userLocation={location}
          onSearchArea={onSearchArea}
          isSearching={isSearching}
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-xs transition-colors duration-150 ${className}`}>
      
      {/* Floating "Search This Area" Button */}
      {onSearchArea && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
          <button
            type="button"
            onClick={() => onSearchArea(mapCenter || defaultPosition)}
            disabled={isSearching}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-850 text-gray-800 dark:text-slate-100 hover:text-red-600 dark:hover:text-red-400 text-xs font-medium border border-gray-300 dark:border-slate-700 shadow-md transition-transform active:scale-95 cursor-pointer disabled:opacity-70"
          >
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600 dark:text-red-400" />
            ) : (
              <Search className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            )}
            <span>{isSearching ? 'Searching Area...' : 'Search This Area'}</span>
          </button>
        </div>
      )}

      <APIProvider
        apiKey={apiKey}
        onError={(err) => {
          console.error('Google Maps API Script Failed to Load:', err);
          setLoadError(true);
        }}
      >
        <Map
          mapId={mapId}
          defaultCenter={defaultPosition}
          center={defaultPosition}
          defaultZoom={zoom}
          onCameraChanged={(ev) => {
            if (ev.detail.center) {
              setMapCenter(ev.detail.center);
            }
          }}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          className="w-full h-full"
          style={{ width: '100%', height: '100%', borderRadius: '1rem' }}
        >
          {/* User Location Marker */}
          {location && (
            <Marker
              position={{ lat: location.lat, lng: location.lng }}
              title="Your Current Location"
            >
              <Pin
                background="#00F0FF"
                borderColor="#FFFFFF"
                glyphColor="#020617"
                scale={1.2}
              />
            </Marker>
          )}

          {/* Emergency Services Place Markers (Reusable) */}
          {places.map((place) => {
            const isSelected = selectedPlace?.id === place.id;
            return (
              <Marker
                key={place.id}
                position={{ lat: place.lat, lng: place.lng }}
                title={place.name}
                onClick={() => onSelectPlace && onSelectPlace(place)}
              >
                <Pin
                  background={
                    place.category === 'hospitals' || place.category === 'hospital'
                      ? '#EF4444'
                      : place.category === 'pharmacies' || place.category === 'pharmacy'
                      ? '#10B981'
                      : place.category === 'blood-banks' || place.category === 'blood_bank'
                      ? '#F43F5E'
                      : '#F59E0B'
                  }
                  borderColor="#FFFFFF"
                  glyphColor="#FFFFFF"
                  scale={isSelected ? 1.3 : 1.0}
                />
              </Marker>
            );
          })}
        </Map>
      </APIProvider>

      {/* Switch Map Engine Control Button */}
      <div className="absolute bottom-3 right-3 z-10">
        <button
          onClick={() => setUseOpenSourceFallback(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/95 dark:bg-slate-900/95 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white text-xs font-normal transition-colors shadow-xs"
          title="Switch to Leaflet Tile Map"
        >
          <Layers className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          <span>Switch Map Engine</span>
        </button>
      </div>

    </div>
  );
}
