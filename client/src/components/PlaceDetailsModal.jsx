import React from 'react';
import { X, Phone, Navigation, MapPin, Clock, Globe, AlertTriangle, Droplet } from 'lucide-react';

export default function PlaceDetailsModal({ place, onClose }) {
  if (!place) return null;

  const directTel = place.phone ? `tel:${place.phone}` : `tel:${place.emergencyHelpline || '112'}`;
  const googleNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-gray-900 dark:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
        <button 
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" 
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <span className="text-[10px] uppercase font-normal tracking-wider text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/60">
            {place.category.replace('_', ' ')} DETAILS
          </span>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mt-2">
            {place.name}
          </h2>
        </div>

        {!place.hasDirectPhone && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="block font-medium">Official Phone Not Listed Directly</span>
              <span className="text-gray-600 dark:text-slate-400 font-normal">
                For urgent assistance, click below to connect with National Emergency Helpline ({place.emergencyHelpline || '112'}).
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2.5 text-xs text-gray-600 dark:text-slate-300">
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800">
            <MapPin className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="block font-medium text-gray-800 dark:text-slate-200">Address</span>
              <span className="font-normal text-gray-600 dark:text-slate-400">{place.address}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="block font-medium text-gray-800 dark:text-slate-200">Operational Status</span>
              <span className="font-normal text-emerald-700 dark:text-emerald-400">{place.openingHours}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800">
            <Phone className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="block font-medium text-gray-800 dark:text-slate-200">Contact Number</span>
              <span className="font-normal text-gray-600 dark:text-slate-400">
                {place.hasDirectPhone ? place.phone : `Emergency Helpline: ${place.emergencyHelpline || '112'}`}
              </span>
            </div>
          </div>

          {place.website && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800">
              <Globe className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="block font-medium text-gray-800 dark:text-slate-200">Official Website</span>
                <a 
                  href={place.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-red-600 dark:text-red-400 hover:underline font-normal"
                >
                  {place.website}
                </a>
              </div>
            </div>
          )}

          {place.bloodAvailability && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-red-700 dark:text-red-400 mb-2">
                <Droplet className="w-4 h-4" />
                <span>Live Blood Stock Status</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                {Object.entries(place.bloodAvailability).map(([group, status]) => (
                  <div key={group} className="bg-white dark:bg-slate-900 p-1.5 rounded border border-red-100 dark:border-red-900/40 font-normal">
                    <span className="font-medium text-gray-800 dark:text-slate-200">{group}:</span> <span className={status === 'Available' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}>{status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <a 
            href={directTel} 
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{place.hasDirectPhone ? 'Call Direct' : `Call Helpline (${place.emergencyHelpline || '112'})`}</span>
          </a>

          <a 
            href={googleNavUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-normal bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
            <span>Open Directions</span>
          </a>
        </div>
      </div>
    </div>
  );
}
