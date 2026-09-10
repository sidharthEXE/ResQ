import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center h-8 w-14 rounded-full p-1 transition-colors duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-95 shrink-0 ${
        isDark
          ? 'bg-slate-900 border border-slate-700 shadow-inner'
          : 'bg-amber-100/90 border border-amber-300/80 shadow-inner'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Background Track Icons */}
      <div className="absolute inset-0 px-2 flex items-center justify-between pointer-events-none text-[10px]">
        {/* Sun on left */}
        <Sun
          className={`w-3.5 h-3.5 text-amber-500 transition-opacity duration-150 ${
            isDark ? 'opacity-30' : 'opacity-0'
          }`}
        />
        {/* Moon on right */}
        <Moon
          className={`w-3.5 h-3.5 text-indigo-400 transition-opacity duration-150 ${
            isDark ? 'opacity-0' : 'opacity-30'
          }`}
        />
      </div>

      {/* Animated Sliding Thumb */}
      <div
        className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full shadow-md transition-transform duration-200 ease-out will-change-transform ${
          isDark
            ? 'translate-x-6 bg-slate-800 border border-indigo-400/40 text-sky-200'
            : 'translate-x-0 bg-white border border-amber-300 text-amber-500'
        }`}
      >
        <Moon
          className={`w-3.5 h-3.5 fill-sky-200/20 text-sky-200 absolute transition-all duration-200 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50 pointer-events-none'
          }`}
        />
        <Sun
          className={`w-3.5 h-3.5 fill-amber-500/20 text-amber-500 absolute transition-all duration-200 ${
            isDark ? 'opacity-0 rotate-90 scale-50 pointer-events-none' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
      </div>
    </button>
  );
}
