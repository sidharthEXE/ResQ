import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlaceDetails } from '../hooks/usePlaceDetails';
import GoogleMapContainer from '../components/GoogleMapContainer';
import { 
  ArrowLeft, Phone, Navigation, MapPin, Clock, ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';

export default function PlaceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { place, isLoading, error, refetch } = usePlaceDetails(id);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-32 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-500 dark:text-slate-400 font-normal text-sm">Retrieving facility details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">Error Loading Details</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm font-normal">{error}</p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-200 font-normal text-xs border border-gray-200 dark:border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-colors"
          >
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">Place Not Found</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm font-normal">The emergency facility ID you requested does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-200 font-normal text-xs border border-gray-200 dark:border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>
    );
  }

  const directPhone = place.phone ? `tel:${place.phone}` : `tel:${place.emergencyHelpline}`;
  const googleNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-normal text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Previous View</span>
      </button>

      {/* Main Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-normal uppercase tracking-wider text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/60">
                {place.category.replace('_', ' ')}
              </span>
              {place.isVerified && (
                <span className="flex items-center gap-1 text-[10px] font-normal text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified Medical Provider</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-medium text-gray-900 dark:text-white leading-tight">
              {place.name}
            </h1>
          </div>

          <div className="shrink-0 text-left sm:text-right">
            <span className="inline-block px-3 py-1 text-xs font-normal text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
              {place.formattedDistance} away
            </span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <a
            href={directPhone}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>{place.phone ? `Call ${place.phone}` : `Call Helpline (${place.emergencyHelpline})`}</span>
          </a>

          <a
            href={googleNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-normal bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 transition-colors"
          >
            <Navigation className="w-4 h-4 text-gray-500 dark:text-slate-400" />
            <span>Open Maps Directions</span>
          </a>
        </div>

        {/* Place Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
          
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800">
            <MapPin className="w-4 h-4 text-gray-500 dark:text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="block text-xs uppercase tracking-wider text-gray-400 dark:text-slate-500 font-normal mb-0.5">Address</span>
              <span className="text-sm text-gray-800 dark:text-slate-200 font-normal">{place.address}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="block text-xs uppercase tracking-wider text-gray-400 dark:text-slate-500 font-normal mb-0.5">Hours of Operation</span>
              <span className="text-sm text-emerald-700 dark:text-emerald-400 font-normal">{place.openingHours}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Embedded Map Section */}
      <div className="space-y-2">
        <h3 className="text-base font-medium text-gray-900 dark:text-white">Location Map</h3>
        <div className="h-80 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800">
          <GoogleMapContainer places={[place]} selectedPlace={place} center={{ lat: place.lat, lng: place.lng }} />
        </div>
      </div>

    </div>
  );
}
