import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Navigation, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

function PlaceCard({ place, isSelected, onSelect }) {
  const directPhone = place.phone ? `tel:${place.phone}` : `tel:${place.emergencyHelpline}`;
  const googleNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

  const is24Hours = place.is24x7 || /24/i.test(place.openingHours);

  return (
    <div
      onClick={() => onSelect && onSelect(place)}
      className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl card-hover border cursor-pointer transition-colors duration-150 ${
        isSelected
          ? 'border-red-400 dark:border-red-500/80 bg-red-50/40 dark:bg-red-950/30 ring-1 ring-red-400/20 dark:ring-red-500/20'
          : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-700 shadow-xs'
      }`}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2.5 mb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-normal uppercase tracking-wider text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900/60">
              {place.category.replace('_', ' ')}
            </span>
            {place.isVerified && (
              <span className="flex items-center gap-1 text-[10px] font-normal text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/60">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Verified</span>
              </span>
            )}
          </div>

          <span className="shrink-0 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full">
            {place.formattedDistance}
          </span>
        </div>

        {/* Place Name */}
        <h4 className="text-base font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug mb-2">
          {place.name}
        </h4>

        {/* Metadata Details */}
        <div className="space-y-1.5 text-xs text-gray-500 dark:text-slate-400 mb-4 font-normal">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0 mt-0.5" />
            <span className="break-words line-clamp-2 text-gray-600 dark:text-slate-300 text-[11px] font-normal">{place.address}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-normal">
            <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
            <span className={`flex items-center gap-1.5 ${is24Hours ? 'text-emerald-700 dark:text-emerald-400 font-normal' : 'text-gray-500 dark:text-slate-400'}`}>
              {is24Hours && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
              <span className="truncate">{place.openingHours}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
        <a
          href={directPhone}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          <Phone className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Call</span>
        </a>

        <a
          href={googleNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-normal bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400 shrink-0" />
          <span className="truncate">Directions</span>
        </a>

        <Link
          to={`/place/${place.id}`}
          className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-normal bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 transition-colors"
        >
          <span className="truncate">Details</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-slate-500" />
        </Link>
      </div>
    </div>
  );
}

export default React.memo(PlaceCard);
