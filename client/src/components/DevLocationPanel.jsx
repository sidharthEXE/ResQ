import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { Terminal, CheckCircle2, AlertTriangle, XCircle, Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function DevLocationPanel() {
  const { location, isLoading, errorStatus, clearLocation } = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);

  // Render only in development environment or dev preview
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] max-w-sm w-full font-sans">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-lg overflow-hidden text-xs transition-colors">
        
        {/* Panel Header Bar */}
        <div className="bg-gray-50 dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 px-3.5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-gray-700 dark:text-slate-300 font-normal">
            <Terminal className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
            <span>DEV LOCATION PANEL</span>
            <span className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-800 text-[10px] text-gray-600 dark:text-slate-400">v1.0</span>
          </div>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isMinimized ? 'Expand Panel' : 'Minimize Panel'}
          >
            {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Panel Body */}
        {!isMinimized && (
          <div className="p-3.5 space-y-3">
            
            {/* Status Indicator */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-slate-400 text-[11px] font-normal">GPS Status:</span>
              {isLoading ? (
                <span className="flex items-center gap-1.5 font-normal text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/60">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Locating...</span>
                </span>
              ) : location ? (
                <span className="flex items-center gap-1 font-normal text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/60">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Active Lock</span>
                </span>
              ) : errorStatus ? (
                <span className="flex items-center gap-1 font-normal text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/60">
                  <XCircle className="w-3 h-3" />
                  <span>{errorStatus.type}</span>
                </span>
              ) : (
                <span className="font-normal text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700">
                  Idle (Not Requested)
                </span>
              )}
            </div>

            {/* Coordinates Display */}
            {location ? (
              <div className="space-y-1.5 bg-gray-50 dark:bg-slate-950 p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-200">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400 font-normal">Latitude:</span>
                  <span className="font-normal text-gray-900 dark:text-white">{location.lat.toFixed(6)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400 font-normal">Longitude:</span>
                  <span className="font-normal text-gray-900 dark:text-white">{location.lng.toFixed(6)}°</span>
                </div>
                {location.accuracy && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400 font-normal">Accuracy:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-normal">±{location.accuracy} meters</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 pt-1 border-t border-gray-200 dark:border-slate-800">
                  <span>Timestamp:</span>
                  <span>{location.timestamp}</span>
                </div>
              </div>
            ) : errorStatus ? (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-red-800 dark:text-red-300">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Error Code: {errorStatus.code}</span>
                </div>
                <p className="text-[11px] leading-tight font-normal text-red-700 dark:text-red-400">{errorStatus.message}</p>
              </div>
            ) : (
              <div className="text-[11px] text-gray-500 dark:text-slate-400 italic bg-gray-50 dark:bg-slate-950 p-2 rounded border border-gray-200 dark:border-slate-800 text-center font-normal">
                Click "Use My Location" to trigger browser Geolocation API.
              </div>
            )}

            {/* Panel Actions */}
            {location && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={clearLocation}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-normal text-[11px] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                  <span>Clear Coordinates</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
