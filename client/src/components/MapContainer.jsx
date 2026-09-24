import React, { useState, useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { 
  Search, Loader2, Navigation, Plus, Minus, Crosshair, 
  MapPin, Phone, ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getMapPinIcon, userLocationIcon } from '../utils/mapIcons';

function MapRecenter({ center, selectedPlace }) {
  const map = useMap();
  const lastKeyRef = React.useRef('');

  useEffect(() => {
    if (selectedPlace) {
      const key = `place-${selectedPlace.id}-${selectedPlace.lat}-${selectedPlace.lng}`;
      if (lastKeyRef.current !== key) {
        lastKeyRef.current = key;
        map.panTo([selectedPlace.lat, selectedPlace.lng], { animate: true, duration: 0.35 });
      }
    } else if (center) {
      const key = `center-${center.lat}-${center.lng}`;
      if (lastKeyRef.current !== key) {
        lastKeyRef.current = key;
        map.panTo([center.lat, center.lng], { animate: true, duration: 0.35 });
      }
    }
  }, [center, selectedPlace, map]);

  return null;
}

function MapEventsTracker({ onCenterChange }) {
  const map = useMapEvents({
    moveend: () => {
      const c = map.getCenter();
      onCenterChange({ lat: c.lat, lng: c.lng });
    }
  });

  return null;
}

/**
 * Custom Floating Map Controls (Zoom In, Zoom Out, Recenter)
 * Matches Vercel / Geist UI aesthetics with frosted glass styling
 */
function FloatingMapControls({ userLocation, onRecenterUser }) {
  const map = useMap();

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
      {/* Zoom Pill Group */}
      <div className="flex flex-col bg-white/95 dark:bg-slate-900/95 border border-gray-200 dark:border-slate-800 rounded-xl shadow-md overflow-hidden transition-colors">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          aria-label="Zoom In"
          title="Zoom In"
          className="p-2 text-gray-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border-b border-gray-100 dark:border-slate-800 flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => map.zoomOut()}
          aria-label="Zoom Out"
          title="Zoom Out"
          className="p-2 text-gray-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Recenter to User GPS Location */}
      {userLocation && (
        <button
          type="button"
          onClick={() => {
            map.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 0.5 });
            if (onRecenterUser) onRecenterUser();
          }}
          aria-label="Recenter to my location"
          title="Recenter to my location"
          className="p-2 bg-white/95 dark:bg-slate-900/95 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center"
        >
          <Crosshair className="w-4 h-4 text-red-600 dark:text-red-400" />
        </button>
      )}
    </div>
  );
}

export default function MapContainer({ 
  places = [], 
  selectedPlace, 
  onSelectPlace, 
  center = { lat: 28.6139, lng: 77.2090 },
  userLocation,
  onSearchArea,
  isSearching = false
}) {
  const { isDark } = useTheme();
  const [currentCenter, setCurrentCenter] = useState(center);

  // Sync internal center if prop changes externally
  useEffect(() => {
    if (center) {
      setCurrentCenter(center);
    }
  }, [center]);

  const handleSearchClick = () => {
    if (onSearchArea && currentCenter) {
      onSearchArea(currentCenter);
    }
  };

  const handleResetToUserLocation = () => {
    if (onSearchArea && userLocation) {
      onSearchArea({ lat: userLocation.lat, lng: userLocation.lng });
    }
  };

  // Default to standard, 100% free OpenStreetMap (never requires an API key and never shows watermarks)
  const olaApiKey = import.meta.env.VITE_OLA_MAPS_API_KEY;
  const cartoApiKey = import.meta.env.VITE_CARTO_API_KEY;

  let tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  let providerLabel = 'OpenStreetMap';

  if (olaApiKey) {
    tileUrl = `https://api.olamaps.io/tiles/v1/styles/${isDark ? 'default-dark-standard' : 'default-light-standard'}/{z}/{x}/{y}.png?api_key=${olaApiKey}`;
    providerLabel = 'Ola Maps';
  } else if (cartoApiKey) {
    tileUrl = isDark
      ? `https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${cartoApiKey}`
      : `https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${cartoApiKey}`;
    providerLabel = 'CARTO';
  }

  return (
    <div className="w-full h-full min-h-[350px] rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-xs relative transition-colors duration-150 group">
      
      {/* Floating "Search This Area" Pill */}
      {onSearchArea && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto">
          <button
            type="button"
            onClick={handleSearchClick}
            disabled={isSearching}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-850 text-gray-800 dark:text-slate-100 hover:text-red-600 dark:hover:text-red-400 text-xs font-medium border border-gray-200 dark:border-slate-700 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-70 backdrop-blur-xs"
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

      {/* Floating Map Info / Status Chip in Top Left */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-none hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 border border-gray-200/80 dark:border-slate-800 text-[11px] text-gray-600 dark:text-slate-300 shadow-xs backdrop-blur-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>Live Radar: {places.length} Facilities</span>
      </div>

      {/* Discreet Map Attribution Badge in Bottom Right */}
      <div className="absolute bottom-2 right-2 z-[1000] pointer-events-none">
        <span className="px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 border border-gray-200/60 dark:border-slate-800/60 text-[9px] text-gray-500 dark:text-slate-400">
          © {providerLabel} contributors
        </span>
      </div>

      <LeafletMap
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom={false}
        doubleClickZoom={true}
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url={tileUrl} />

        <MapRecenter center={center} selectedPlace={selectedPlace} />
        <MapEventsTracker onCenterChange={setCurrentCenter} />
        <FloatingMapControls 
          userLocation={userLocation} 
          onRecenterUser={handleResetToUserLocation} 
        />

        {/* User Location Marker with real radar puck */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <div className="p-2 text-center min-w-[140px]">
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 mb-0.5">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Your GPS Location</span>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-slate-400 font-normal">
                  {userLocation.lat.toFixed(4)}° N, {userLocation.lng.toFixed(4)}° E
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Nearby Place Markers with Real SVG Icons */}
        {places.filter(place => place && typeof place.lat === 'number' && typeof place.lng === 'number').map((place) => {
          const isSelected = selectedPlace?.id === place.id;
          const directPhone = place.phone || place.emergencyHelpline;
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={getMapPinIcon(place.category, isSelected)}
              eventHandlers={{
                click: () => onSelectPlace && onSelectPlace(place)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[210px] space-y-2 text-gray-900 dark:text-white">
                  {/* Category Pill + Distance */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900/50">
                      {place.category.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-medium text-gray-600 dark:text-slate-300">
                      {place.formattedDistance}
                    </span>
                  </div>

                  {/* Facility Name */}
                  <h4 className="font-semibold text-sm leading-snug">
                    {place.name}
                  </h4>

                  {/* Address */}
                  <div className="flex items-start gap-1 text-[11px] text-gray-500 dark:text-slate-400">
                    <MapPin className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{place.address}</span>
                  </div>

                  {/* Operational Status */}
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ● {place.openingHours || 'Open 24/7'}
                  </div>

                  {/* Quick CTAs */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {directPhone ? (
                      <a
                        href={`tel:${directPhone}`}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    ) : null}

                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-1.5 px-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-100 rounded-lg text-xs font-medium transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </LeafletMap>
    </div>
  );
}
