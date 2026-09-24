import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { Terminal, CheckCircle2, XCircle, Loader2, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react';

const STORAGE_KEY = 'resq_dev_panel_dismissed';

export default function DevLocationPanel() {
  const { location, isLoading, errorStatus, clearLocation } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Render only in development environment
  if (!import.meta.env.DEV || isDismissed) return null;

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
  };

  return (
    <div className="fixed bottom-3 right-3 z-[9999] font-sans text-xs select-none">
      {/* Expanded Popover Details */}
      {isOpen && (
        <div className="mb-2 w-72 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-down">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-slate-950 px-3.5 py-2 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between text-gray-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5 font-medium text-[11px]">
              <Terminal className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
              <span>DEV LOCATION TOOLS</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 p-0.5 rounded cursor-pointer"
              title="Collapse"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Details */}
          <div className="p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500 dark:text-slate-400">GPS Signal:</span>
              {isLoading ? (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Locating...</span>
                </span>
              ) : location ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Active Lock</span>
                </span>
              ) : errorStatus ? (
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                  <XCircle className="w-3 h-3" />
                  <span>{errorStatus.type}</span>
                </span>
              ) : (
                <span className="text-gray-500 dark:text-slate-400">Idle</span>
              )}
            </div>

            {location && (
              <div className="space-y-1 bg-gray-50 dark:bg-slate-950 p-2 rounded-xl border border-gray-200/80 dark:border-slate-800 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Lat:</span>
                  <span className="font-mono text-gray-900 dark:text-slate-200">{location.lat.toFixed(5)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Lng:</span>
                  <span className="font-mono text-gray-900 dark:text-slate-200">{location.lng.toFixed(5)}°</span>
                </div>
                {location.accuracy && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">Accuracy:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">±{location.accuracy}m</span>
                  </div>
                )}
              </div>
            )}

            {location && (
              <div className="flex justify-end pt-0.5">
                <button
                  onClick={clearLocation}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/60 text-[10px] font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Reset GPS</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ultra-Compact Bottom-Right Floating Pill Badge */}
      <div className="inline-flex items-center gap-1.5 p-1 px-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-gray-200 dark:border-slate-800 shadow-md text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-700 transition-all">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium"
          title="Toggle Dev Location Details"
        >
          <Terminal className="w-3 h-3 text-red-500" />
          <span className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-wider font-semibold">DEV GPS</span>
          {location ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          )}
          {location && (
            <span className="font-mono text-[10px] text-gray-600 dark:text-slate-300">
              {location.lat.toFixed(2)}°, {location.lng.toFixed(2)}°
            </span>
          )}
          {isOpen ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronUp className="w-3 h-3 text-gray-400" />}
        </button>

        <span className="w-[1px] h-3 bg-gray-200 dark:bg-slate-800 mx-0.5" />

        {/* Quick Close Button to dismiss entirely */}
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 p-0.5 rounded-full transition-colors cursor-pointer"
          title="Dismiss Dev Panel for this session"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
