import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
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
  }, [center?.lat, center?.lng, selectedPlace?.id, map]);

  return null;
}

export default function EmergencyMap({ 
  userLocation, 
  places, 
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
              <div style={{ textAlign: 'center', padding: '0.2rem' }}>
                <strong style={{ color: 'var(--accent-cyan)' }}>📍 Your Location</strong>
                <div style={{ fontSize: '0.75rem', color: '#ccc' }}>
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Emergency Place Pins */}
        {places.map((place) => {
          const isSelected = selectedPlace?.id === place.id;
          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={getMapPinIcon(place.category, isSelected)}
              eventHandlers={{
                click: () => onSelectPlace(place)
              }}
            >
              <Popup>
                <div style={{ minWidth: '180px', padding: '0.25rem' }}>
                  <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '0.2rem' }}>
                    {place.name}
                  </strong>
                  <div style={{ fontSize: '0.78rem', color: '#aaa', marginBottom: '0.4rem' }}>
                    {place.formattedDistance} • {place.openingHours}
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button 
                      className="btn-primary" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => onViewDetails(place)}
                    >
                      Details
                    </button>
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', textDecoration: 'none' }}
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
