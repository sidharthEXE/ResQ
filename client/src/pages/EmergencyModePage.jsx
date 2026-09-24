import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import {
  X, Building2, Truck, Droplet, Share2, Phone, Navigation,
  AlertTriangle, MapPin, ArrowLeft, Copy, Check
} from 'lucide-react';

const VIEWS = {
  MENU: 'MENU',
  HOSPITAL: 'HOSPITAL',
  AMBULANCE: 'AMBULANCE',
  BLOOD_SELECT: 'BLOOD_SELECT',
  BLOOD_RESULTS: 'BLOOD_RESULTS',
  SHARE: 'SHARE',
};

function EmergencyResultCard({ place }) {
  const hasPhone = place.phone && place.phone.trim().length > 0;
  const googleNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-3 shadow-xs transition-colors">
      <div>
        <h3 className="text-base font-medium text-gray-900 dark:text-white leading-snug break-words">{place.name}</h3>
        {place.address && (
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 break-words line-clamp-2 font-normal">{place.address}</p>
        )}
        {place.formattedDistance && (
          <span className="inline-block mt-1.5 px-2 py-0.5 text-xs font-normal text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md">
            {place.formattedDistance}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {hasPhone ? (
          <a
            href={`tel:${place.phone}`}
            className="flex items-center justify-center gap-2 min-h-[44px] rounded-xl text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>CALL</span>
          </a>
        ) : (
          <div className="flex items-center justify-center gap-2 min-h-[44px] rounded-xl text-xs font-normal bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-slate-700 cursor-not-allowed">
            <Phone className="w-4 h-4" />
            <span>No Phone</span>
          </div>
        )}
        <a
          href={googleNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 min-h-[44px] rounded-xl text-xs font-normal bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 transition-colors"
        >
          <Navigation className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          <span>DIRECTIONS</span>
        </a>
      </div>
    </div>
  );
}

function DonorResultCard({ donor }) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-3 shadow-xs transition-colors">
      <div className="flex justify-between items-start">
        <h3 className="text-base font-medium text-gray-900 dark:text-white">{donor.name}</h3>
        <span className="px-2.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-md">
          {donor.bloodGroup}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 font-normal">
        <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
        <span>Approx: {donor.approximateLocation.lat}, {donor.approximateLocation.lng}</span>
      </div>
      <a
        href={`tel:${donor.phone}`}
        className="flex items-center justify-center gap-2 w-full min-h-[44px] rounded-xl text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
      >
        <Phone className="w-4 h-4" />
        <span>CALL DONOR</span>
      </a>
    </div>
  );
}

function EmergencyLoading({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3">
      <div className="w-10 h-10 border-2 border-red-200 dark:border-red-900 border-t-red-600 dark:border-t-red-500 rounded-full animate-spin"></div>
      <p className="text-gray-500 dark:text-slate-400 font-normal text-center text-xs">{message}</p>
    </div>
  );
}

function EmergencyError({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
      <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
      </div>
      <p className="text-red-700 dark:text-red-300 font-normal text-xs max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 min-h-[40px] rounded-xl text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

function EmergencyEmpty({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-850 border border-gray-200 dark:border-slate-800 flex items-center justify-center">
        <MapPin className="w-6 h-6 text-gray-400 dark:text-slate-500" />
      </div>
      <p className="text-gray-500 dark:text-slate-400 font-normal text-xs max-w-xs">{message}</p>
    </div>
  );
}

export default function EmergencyModePage() {
  const navigate = useNavigate();
  const { location, isLoading: isLocating, errorStatus, requestLocation } = useLocation();

  const [view, setView] = useState(VIEWS.MENU);

  // Place search state
  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState(null);

  // Blood donor state
  const [selectedBloodGroup, setSelectedBloodGroup] = useState(null);
  const [donors, setDonors] = useState([]);
  const [donorsLoading, setDonorsLoading] = useState(false);
  const [donorsError, setDonorsError] = useState(null);

  // Share location state
  const [copied, setCopied] = useState(false);

  const fetchPlaces = useCallback(async (category) => {
    if (!location) {
      requestLocation();
      return;
    }

    setPlacesLoading(true);
    setPlacesError(null);
    setPlaces([]);

    try {
      const params = new URLSearchParams({
        lat: location.lat,
        lng: location.lng,
        radius: 10000,
        category,
      });
      const res = await fetch(`/api/places/nearby?${params.toString()}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const result = await res.json();
      if (result.status === 'success') {
        setPlaces(result.data || []);
      } else {
        throw new Error(result.message || 'Search failed');
      }
    } catch (err) {
      setPlacesError(err.message);
    } finally {
      setPlacesLoading(false);
    }
  }, [location, requestLocation]);

  const fetchDonors = useCallback(async (bloodGroup) => {
    if (!location) {
      requestLocation();
      return;
    }

    setDonorsLoading(true);
    setDonorsError(null);
    setDonors([]);

    try {
      const params = new URLSearchParams({
        bloodGroup,
        lat: location.lat,
        lng: location.lng,
        radiusKm: 25,
      });
      const res = await fetch(`/api/donors/search?${params.toString()}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setDonors(data);
    } catch (err) {
      setDonorsError(err.message);
    } finally {
      setDonorsLoading(false);
    }
  }, [location, requestLocation]);

  const handleHospital = () => {
    setView(VIEWS.HOSPITAL);
    if (location) {
      fetchPlaces('hospital');
    } else {
      requestLocation();
    }
  };

  const handleAmbulance = () => {
    setView(VIEWS.AMBULANCE);
    if (location) {
      fetchPlaces('ambulance');
    } else {
      requestLocation();
    }
  };

  const handleBlood = () => {
    setView(VIEWS.BLOOD_SELECT);
  };

  const handleBloodGroupSelect = (group) => {
    setSelectedBloodGroup(group);
    setView(VIEWS.BLOOD_RESULTS);
    if (location) {
      fetchDonors(group);
    } else {
      requestLocation();
    }
  };

  const handleShare = () => {
    setView(VIEWS.SHARE);
    if (!location) {
      requestLocation();
    }
  };

  useEffect(() => {
    if (!location) return;

    if (view === VIEWS.HOSPITAL && places.length === 0 && !placesLoading && !placesError) {
      fetchPlaces('hospital');
    }
    if (view === VIEWS.AMBULANCE && places.length === 0 && !placesLoading && !placesError) {
      fetchPlaces('ambulance');
    }
    if (view === VIEWS.BLOOD_RESULTS && selectedBloodGroup && donors.length === 0 && !donorsLoading && !donorsError) {
      fetchDonors(selectedBloodGroup);
    }
  }, [location, view, selectedBloodGroup, places.length, donors.length, placesLoading, placesError, donorsLoading, donorsError, fetchPlaces, fetchDonors]);

  const shareMessage = location
    ? `EMERGENCY — I need help!\nMy location: https://www.google.com/maps?q=${location.lat},${location.lng}`
    : '';

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareMessage });
      } catch {
        // User cancelled share
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareMessage).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const goBack = () => {
    setView(VIEWS.MENU);
    setPlaces([]);
    setPlacesError(null);
    setDonors([]);
    setDonorsError(null);
    setSelectedBloodGroup(null);
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-50 transition-colors">
      {view === VIEWS.MENU ? (
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 min-h-[38px] px-3 rounded-lg text-xs font-normal text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Exit</span>
        </button>
      ) : (
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 min-h-[38px] px-3 rounded-lg text-xs font-normal text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      )}
      <span className="text-red-600 dark:text-red-400 font-medium text-sm tracking-wide">EMERGENCY MODE</span>
      <div className="w-16"></div>
    </div>
  );

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-8 max-w-lg mx-auto w-full space-y-3.5">
      <div className="text-center space-y-1 mb-2">
        <h1 className="text-2xl sm:text-3xl font-medium text-gray-900 dark:text-white tracking-tight">What do you need?</h1>
        <p className="text-gray-500 dark:text-slate-400 text-xs font-normal">Direct emergency dispatch & rapid nearby facilities</p>
      </div>

      <button onClick={handleHospital} className="w-full flex items-center justify-between px-5 min-h-[64px] rounded-2xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <span>NEAREST HOSPITAL</span>
        </div>
        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-md font-normal">FIND &rarr;</span>
      </button>

      <button onClick={handleAmbulance} className="w-full flex items-center justify-between px-5 min-h-[64px] rounded-2xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <span>CALL AMBULANCE</span>
        </div>
        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-md font-normal">DISPATCH &rarr;</span>
      </button>

      <button onClick={handleBlood} className="w-full flex items-center justify-between px-5 min-h-[64px] rounded-2xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Droplet className="w-5 h-5" />
          </div>
          <span>EMERGENCY BLOOD</span>
        </div>
        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-md font-normal">DONORS &rarr;</span>
      </button>

      <button onClick={handleShare} className="w-full flex items-center justify-between px-5 min-h-[64px] rounded-2xl text-sm font-medium text-white bg-gray-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-750 border border-transparent dark:border-slate-700 transition-colors shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <span>BROADCAST SOS GPS</span>
        </div>
        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-md font-normal">SHARE</span>
      </button>
    </div>
  );

  const renderPlaceResults = (label) => {
    if (!location && !errorStatus) {
      return <EmergencyLoading message="Getting your location..." />;
    }
    if (isLocating) {
      return <EmergencyLoading message="Locating you..." />;
    }
    if (errorStatus) {
      return (
        <EmergencyError
          message={errorStatus.message}
          onRetry={requestLocation}
        />
      );
    }
    if (placesLoading) {
      return <EmergencyLoading message={`Searching for nearest ${label}...`} />;
    }
    if (placesError) {
      return (
        <EmergencyError
          message={placesError}
          onRetry={() => fetchPlaces(label === 'hospitals' ? 'hospital' : 'ambulance')}
        />
      );
    }
    if (places.length === 0) {
      return <EmergencyEmpty message={`No ${label} found nearby. Try expanding your search from the main app.`} />;
    }

    return (
      <div className="px-4 py-4 space-y-3 max-w-lg mx-auto w-full">
        <h2 className="text-base font-medium text-gray-900 dark:text-white">{places.length} Nearest {label}</h2>
        {places.slice(0, 10).map((place) => (
          <EmergencyResultCard key={place.id} place={place} />
        ))}
      </div>
    );
  };

  const renderBloodSelect = () => (
    <div className="flex flex-col items-center flex-1 px-4 py-8 space-y-4 max-w-sm mx-auto w-full">
      <h2 className="text-xl font-medium text-gray-900 dark:text-white text-center">Which blood group?</h2>
      <p className="text-gray-500 dark:text-slate-400 text-xs text-center mb-2 font-normal">Select the blood type you need.</p>
      <div className="grid grid-cols-2 gap-2.5 w-full">
        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
          <button
            key={group}
            onClick={() => handleBloodGroupSelect(group)}
            className="flex items-center justify-center min-h-[52px] rounded-xl text-base font-medium bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
          >
            {group}
          </button>
        ))}
      </div>
    </div>
  );

  const renderBloodResults = () => {
    if (!location && !errorStatus) {
      return <EmergencyLoading message="Getting your location..." />;
    }
    if (isLocating) {
      return <EmergencyLoading message="Locating you..." />;
    }
    if (errorStatus) {
      return <EmergencyError message={errorStatus.message} onRetry={requestLocation} />;
    }
    if (donorsLoading) {
      return <EmergencyLoading message={`Searching for ${selectedBloodGroup} donors...`} />;
    }
    if (donorsError) {
      return <EmergencyError message={donorsError} onRetry={() => fetchDonors(selectedBloodGroup)} />;
    }
    if (donors.length === 0) {
      return <EmergencyEmpty message={`No available ${selectedBloodGroup} donors found nearby.`} />;
    }

    return (
      <div className="px-4 py-4 space-y-3 max-w-lg mx-auto w-full">
        <h2 className="text-base font-medium text-gray-900 dark:text-white">{donors.length} {selectedBloodGroup} Donors Found</h2>
        {donors.map((donor) => (
          <DonorResultCard key={donor.id} donor={donor} />
        ))}
      </div>
    );
  };

  const renderShareLocation = () => {
    if (!location && !errorStatus) {
      return <EmergencyLoading message="Requesting location access..." />;
    }
    if (isLocating) {
      return <EmergencyLoading message="Getting precise location..." />;
    }
    if (errorStatus) {
      return <EmergencyError message={errorStatus.message} onRetry={requestLocation} />;
    }

    return (
      <div className="flex flex-col items-center flex-1 px-4 py-8 space-y-5 max-w-sm mx-auto w-full">
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center">
          <MapPin className="w-6 h-6 text-gray-600 dark:text-slate-300" />
        </div>
        <h2 className="text-xl font-medium text-gray-900 dark:text-white text-center">Your Location</h2>
        <div className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-center space-y-1">
          <p className="text-gray-800 dark:text-slate-200 font-mono text-xs font-medium">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
          <p className="text-gray-400 dark:text-slate-500 text-[11px] font-normal">±{location.accuracy || '?'}m accuracy</p>
        </div>

        <div className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-2 font-normal">Shareable message:</p>
          <p className="text-xs text-gray-800 dark:text-slate-200 break-all font-normal leading-relaxed">{shareMessage}</p>
        </div>

        <div className="w-full space-y-2.5">
          {typeof navigator.share === 'function' && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 min-h-[44px] rounded-xl text-xs font-medium bg-gray-900 dark:bg-red-600 hover:bg-black dark:hover:bg-red-700 text-white transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share via Apps</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 min-h-[44px] rounded-xl text-xs font-normal bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 flex flex-col overflow-y-auto transition-colors">
      {renderHeader()}
      {view === VIEWS.MENU && renderMenu()}
      {view === VIEWS.HOSPITAL && renderPlaceResults('hospitals')}
      {view === VIEWS.AMBULANCE && renderPlaceResults('ambulances')}
      {view === VIEWS.BLOOD_SELECT && renderBloodSelect()}
      {view === VIEWS.BLOOD_RESULTS && renderBloodResults()}
      {view === VIEWS.SHARE && renderShareLocation()}
    </div>
  );
}
