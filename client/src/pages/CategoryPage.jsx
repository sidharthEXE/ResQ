import React, { useState } from 'react';
import { MOCK_CATEGORIES } from '../data/mockData';
import { usePlaces } from '../hooks/usePlaces';
import { useLocation } from '../context/LocationContext';
import PlaceCard from '../components/PlaceCard';
import GoogleMapContainer from '../components/GoogleMapContainer';
import SearchBar from '../components/SearchBar';
import ErrorState from '../components/ErrorState';
import { Building2, Pill, Droplet, Truck } from 'lucide-react';

const ICON_MAP = {
  hospitals: Building2,
  pharmacies: Pill,
  'blood-banks': Droplet,
  ambulances: Truck
};

export default function CategoryPage({ categoryId }) {
  const { location } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [radius, setRadius] = useState(10000);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [customCenter, setCustomCenter] = useState(null);

  const categoryMeta = MOCK_CATEGORIES.find((c) => c.id === categoryId) || {
    title: 'Emergency Services',
    description: 'Find nearby emergency facilities'
  };

  const IconComponent = ICON_MAP[categoryId] || Building2;

  const defaultLocation = { lat: 28.6139, lng: 77.2090 };
  const queryLocation = customCenter || location || defaultLocation;

  const { data: apiPlaces, isLoading, error, refetch } = usePlaces(queryLocation, categoryId, radius);

  // Filter places by search text
  const filteredPlaces = apiPlaces.filter((place) => {
    const matchesQuery =
      !searchQuery.trim() ||
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQuery;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* Category Header Banner */}
      <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 flex items-center justify-center shrink-0">
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-medium text-gray-900 dark:text-white">{categoryMeta.title}</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-normal mt-0.5">{categoryMeta.description}</p>
          </div>
        </div>

        <span className="px-3 py-1 text-xs font-normal bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60 rounded-full">
          {isLoading ? 'Scanning Nearby...' : `${filteredPlaces.length} Facilities Active`}
        </span>
      </div>

      {customCenter && (
        <div className="inline-flex items-center gap-2 p-1.5 px-3 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="font-normal">
            Searching map area: {customCenter.lat.toFixed(4)}° N, {customCenter.lng.toFixed(4)}° E
          </span>
          <button
            type="button"
            onClick={() => setCustomCenter(null)}
            className="underline hover:text-red-900 dark:hover:text-red-300 font-medium ml-1 cursor-pointer"
          >
            Reset to My GPS
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        radius={radius}
        onRadiusChange={setRadius}
        onClear={() => {
          setSearchQuery('');
          setRadius(10000);
        }}
      />

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Container */}
        <div className="lg:col-span-7 h-[340px] sm:h-[420px] lg:h-[calc(100vh-6.5rem)] lg:max-h-[720px] lg:sticky lg:top-20 order-1 lg:order-2 rounded-2xl overflow-hidden shadow-xs border border-gray-200 dark:border-slate-800">
          <GoogleMapContainer
            places={filteredPlaces}
            selectedPlace={selectedPlace}
            onSelectPlace={setSelectedPlace}
            center={queryLocation}
            onSearchArea={(newCenter) => {
              setSelectedPlace(null);
              setCustomCenter(newCenter);
            }}
            isSearching={isLoading}
          />
        </div>

        {/* Place Cards List */}
        <div className="lg:col-span-5 space-y-3 order-2 lg:order-1">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="w-20 h-4 rounded-full skeleton-shimmer"></div>
                    <div className="w-14 h-4 rounded-full skeleton-shimmer"></div>
                  </div>
                  <div className="w-48 h-5 rounded-lg skeleton-shimmer"></div>
                  <div className="w-36 h-3.5 rounded skeleton-shimmer"></div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="h-8 rounded-xl skeleton-shimmer"></div>
                    <div className="h-8 rounded-xl skeleton-shimmer"></div>
                    <div className="h-8 rounded-xl skeleton-shimmer"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title="Search Failed"
              message={error}
              onRetry={refetch}
            />
          ) : filteredPlaces.length === 0 ? (
            <ErrorState
              title={`No ${categoryMeta.title} Found`}
              message="No places match your search query or radius limit. Try expanding the radius slider."
              onRetry={() => {
                setSearchQuery('');
                setRadius(25000);
              }}
            />
          ) : (
            filteredPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                isSelected={selectedPlace?.id === place.id}
                onSelect={setSelectedPlace}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
