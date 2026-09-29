import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useTheme } from '../context/ThemeContext';

import { getMapPinIcon, userLocationIcon } from '../utils/mapIcons';

// Map Recenter Controller component
function MapController({ center, selectedPlace }) {
  const map = useMap();
  const lastTargetRef = React.useRef('');

  useEffect(() => {
    if (selectedPlace) {
      const key = `place-${selectedPlace.id}-${selectedPlace.lat}-${selectedPlace.lng}`;
      if (lastTargetRef.current !== key) {
        lastTargetRef.current = key;
        map.panTo([selectedPlace.lat, selectedPlace.lng], { animate: true, duration: 0.35 });
      }
    } else if (center) {
      const key = `center-${center.lat}-${center.lng}`;
      if (lastTargetRef.current !== key) {
        lastTargetRef.current = key;
        map.panTo([center.lat, center.lng], { animate: true, duration: 0.35 });
      }
    }
  }, [center, selectedPlace, map]);

  return null;
}

export default function EmergencyMap({
  userLocation,
  places = [],
  selectedPlace,
  onSelectPlace,
  onViewDetails
}) {
  const { isDark } = useTheme();
  const defaultCenter = userLocation || { lat: 28.6139, lng: 77.2090 };

  const olaApiKey = import.meta.env.VITE_OLA_MAPS_API_KEY;
  const cartoApiKey = import.meta.env.VITE_CARTO_API_KEY;

  let tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  if (olaApiKey) {
    tileUrl = `https://api.olamaps.io/tiles/v1/styles/${isDark ? 'default-dark-standard' : 'default-light-standard'}/{z}/{x}/{y}.png?api_key=${olaApiKey}`;
  } else if (cartoApiKey) {
    tileUrl = isDark
      ? `https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${cartoApiKey}`
      : `https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${cartoApiKey}`;
  }

  return (
    <div className="map-container">
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={14}
        scrollWheelZoom={false}
        doubleClickZoom={true}
        zoomControl={false}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url={tileUrl}
          maxZoom={19}
        />

        <MapController center={userLocation} selectedPlace={selectedPlace} />

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="p-1 text-center">
                <strong className="text-red-600 dark:text-red-400 text-xs block mb-0.5">📍 Your Location</strong>
                <div className="text-[11px] text-gray-600 dark:text-slate-300 font-mono">
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Emergency Place Pins */}
        {places.filter(p => p && typeof p.lat === 'number' && typeof p.lng === 'number').map((place) => {
          const isSelected = selectedPlace?.id === place.id;
          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={getMapPinIcon(place.category, isSelected)}
              eventHandlers={{
                click: () => onSelectPlace?.(place)
              }}
            >
              <Popup>
                <div className="min-w-[180px] p-1 space-y-1.5 text-gray-900 dark:text-white">
                  <strong className="text-sm font-medium block leading-snug">
                    {place.name}
                  </strong>
                  <div className="text-[11px] text-gray-600 dark:text-slate-300">
                    {place.formattedDistance} • {place.openingHours}
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <button
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                      onClick={() => onViewDetails?.(place)}
                    >
                      Details
                    </button>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200"
                    >
                      Route
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
