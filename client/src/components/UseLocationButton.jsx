import React from 'react';
import { useLocation } from '../context/LocationContext';
import { Navigation, Loader2, Check, AlertTriangle } from 'lucide-react';

export default function UseLocationButton({ className = '', variant = 'default' }) {
  const { location, isLoading, errorStatus, requestLocation } = useLocation();

  if (variant === 'compact') {
    return (
      <button
        onClick={requestLocation}
        disabled={isLoading}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-colors border active:scale-95 disabled:opacity-50 cursor-pointer ${
          location
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 font-medium'
            : errorStatus
            ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/60 font-medium'
            : 'bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-800 shadow-xs font-normal'
        } ${className}`}
        title={
          location
            ? `GPS Active: ${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}° (Click to refresh)`
            : errorStatus
            ? `GPS Error: ${errorStatus.message}`
            : 'Click to detect current GPS location'
        }
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
        ) : location ? (
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        ) : errorStatus ? (
          <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400 shrink-0" />
        ) : (
          <Navigation className="w-3 h-3 text-gray-500 dark:text-slate-400 shrink-0" />
        )}

        <span className="text-[11px] whitespace-nowrap">
          {isLoading
            ? 'Locating...'
            : location
            ? 'GPS On'
            : errorStatus
            ? 'GPS Error'
            : 'Locate Me'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={requestLocation}
      disabled={isLoading}
      className={`inline-flex items-center justify-center gap-2 px-4 min-h-[42px] py-2 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
        location
          ? 'bg-emerald-600 hover:bg-emerald-700'
          : errorStatus
          ? 'bg-amber-600 hover:bg-amber-700'
          : 'bg-red-600 hover:bg-red-700'
      } ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>Fetching GPS Signal...</span>
        </>
      ) : location ? (
        <>
          <Check className="w-4 h-4 text-white" />
          <span>Location Locked ({location.lat.toFixed(2)}°, {location.lng.toFixed(2)}°)</span>
        </>
      ) : (
        <>
          <Navigation className="w-4 h-4" />
          <span>Use My Location</span>
        </>
      )}
    </button>
  );
}
