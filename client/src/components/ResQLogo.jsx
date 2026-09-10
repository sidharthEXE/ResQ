import React from 'react';

export default function ResQLogo({ className = '', iconOnly = false, size = 'default' }) {
  const iconSizeClass = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const textSizeClass = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Sleek Custom Rescue Badge */}
      <div
        className={`relative flex items-center justify-center ${iconSizeClass} rounded-xl bg-gradient-to-br from-red-600 via-red-600 to-rose-700 text-white shadow-sm shadow-red-600/30 transition-transform group-hover:scale-105 shrink-0`}
      >
        {/* Crisp Vector Rescue Cross with Dynamic Pulse Ring */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white stroke-[2.2]"
        >
          {/* Medical Cross */}
          <path
            d="M12 5V19M5 12H19"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Subtle Life Ring Corners */}
          <circle
            cx="12"
            cy="12"
            r="8.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeDasharray="3 3"
            className="opacity-60"
          />
        </svg>

        {/* Dynamic Pulse Beacon Glow in Top Right */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white dark:border-slate-900"></span>
        </span>
      </div>

      {!iconOnly && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className={`${textSizeClass} font-bold tracking-tight text-gray-900 dark:text-white leading-tight`}>
              Res<span className="text-red-600 dark:text-red-500">Q</span>
            </span>
            <span className="hidden sm:inline text-xs font-normal text-gray-300 dark:text-slate-600">
              —
            </span>
            <span className="hidden sm:inline text-[11px] font-normal text-gray-500 dark:text-slate-400">
              Emergency Response & Service Locator
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:hidden">
            <span className="text-[10px] uppercase font-normal tracking-wider text-gray-500 dark:text-gray-400">
              Emergency Response & Locator
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
