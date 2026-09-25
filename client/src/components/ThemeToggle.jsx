import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-theme-toggle=""
      role="switch"
      aria-checked={isDark}
      className={`relative inline-flex items-center h-8 w-[58px] rounded-full p-1 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 active:scale-[0.97] transition-all duration-300 shrink-0 ${
        isDark
          ? 'bg-slate-900 border border-slate-700/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]'
          : 'bg-amber-100/90 border border-amber-300/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Background Track Icons */}
      <div className="absolute inset-0 px-2 flex items-center justify-between pointer-events-none">
        {/* Sun on left (revealed when thumb slides to dark) */}
        <Sun
          className={`w-3.5 h-3.5 text-amber-500/70 transition-all duration-300 ease-out ${
            isDark ? 'opacity-70 scale-100' : 'opacity-0 scale-50'
          }`}
        />
        {/* Moon on right (revealed when thumb slides to light) */}
        <Moon
          className={`w-3.5 h-3.5 text-indigo-400/70 transition-all duration-300 ease-out ${
            isDark ? 'opacity-0 scale-50' : 'opacity-70 scale-100'
          }`}
        />
      </div>

      {/* Animated Sliding Thumb */}
      <div
        className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.25,0.64,1)] will-change-transform ${
          isDark
            ? 'translate-x-[26px] bg-slate-800 border border-indigo-400/30 text-indigo-200 shadow-[0_2px_8px_rgba(0,0,0,0.5),0_1px_2px_rgba(99,102,241,0.2)]'
            : 'translate-x-0 bg-white border border-amber-200/90 text-amber-500 shadow-[0_2px_6px_rgba(217,119,6,0.15),0_1px_2px_rgba(0,0,0,0.06)]'
        }`}
      >
        <Moon
          className={`w-3.5 h-3.5 fill-indigo-300/20 text-indigo-300 absolute transition-all duration-300 ease-out ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0 pointer-events-none'
          }`}
        />
        <Sun
          className={`w-3.5 h-3.5 fill-amber-500/20 text-amber-500 absolute transition-all duration-300 ease-out ${
            isDark ? 'opacity-0 rotate-90 scale-0 pointer-events-none' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
      </div>
    </button>
  );
}

