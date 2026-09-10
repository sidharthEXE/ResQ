import React, { useState } from 'react';
import { MOCK_CATEGORIES } from '../data/mockData';
import { usePlaces } from '../hooks/usePlaces';
import { useLocation } from '../context/LocationContext';
import EmergencyCategoryCard from '../components/EmergencyCategoryCard';
import PlaceCard from '../components/PlaceCard';
import GoogleMapContainer from '../components/GoogleMapContainer';
import SearchBar from '../components/SearchBar';
import ErrorState from '../components/ErrorState';
import UseLocationButton from '../components/UseLocationButton';
import { HeartPulse, AlertTriangle, Radio } from 'lucide-react';

export default function HomePage() {
  const { location, errorStatus } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [radius, setRadius] = useState(10000);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [customCenter, setCustomCenter] = useState(null);

  const defaultLocation = { lat: 28.6139, lng: 77.2090 };
  const queryLocation = customCenter || location || defaultLocation;

  const { data: apiPlaces, isLoading, error, refetch } = usePlaces(queryLocation, selectedCategory, radius);

  // Filter places based on search
  const filteredPlaces = apiPlaces.filter((place) => {
    const matchesQuery =
      !searchQuery.trim() ||
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQuery;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xs transition-colors">
        <div className="max-w-3xl space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-normal">
            <HeartPulse className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>24/7 Rapid Emergency Response</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-medium text-gray-900 dark:text-white tracking-tight leading-tight">
            Find Nearest <span className="text-red-600 dark:text-red-400">Emergency Services</span> Instantly
          </h1>

          <p className="text-gray-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            Real-time verified trauma centers, 24/7 pharmacies, blood bank stock, and emergency ambulance fleets within reach.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <UseLocationButton className="w-full sm:w-auto min-h-[42px]" />
          </div>

          {/* Geolocation Status Banner */}
          {errorStatus && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs flex items-start gap-3 mt-3">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="block font-medium text-red-800 dark:text-red-300 text-xs mb-0.5">
                  GPS: {errorStatus.type}
                </span>
                <span className="font-normal">{errorStatus.message}</span>
              </div>
            </div>
          )}

          {location && (
            <div className="inline-flex items-center gap-2 p-2 px-3 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-normal">
                Coordinates locked: {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E (±{location.accuracy || 10}m)
              </span>
            </div>
          )}

          {customCenter && (
            <div className="inline-flex items-center gap-2 p-1.5 px-3 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs mt-2">
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

        </div>
      </section>

      {/* Emergency Category Cards Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Emergency Categories</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-normal">Select a service to view specialized nearby facilities</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_CATEGORIES.map((cat) => (
            <EmergencyCategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Live Map & Nearby List Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Live Emergency Map & Nearby Places</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-normal">Real-time emergency services operating near your coordinates</p>
          </div>
          <span className="text-xs font-normal text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-gray-200 dark:border-slate-700 self-start sm:self-auto">
            {isLoading ? 'Searching...' : `${filteredPlaces.length} Places Found`}
          </span>
        </div>

        {/* Filter Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          radius={radius}
          onRadiusChange={setRadius}
          onClear={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setRadius(10000);
          }}
        />

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Map (Top on Mobile, Right on Desktop) */}
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

          {/* Cards List (Bottom on Mobile, Left on Desktop) */}
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
                title="No Emergency Places Match"
                message="No emergency places found for this category and search radius."
                onRetry={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
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
      </section>

    </div>
  );
}
