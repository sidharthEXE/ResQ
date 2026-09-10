import React from 'react';
import { 
  Search, SlidersHorizontal, X, Building2, Pill, 
  Droplet, Truck, LayoutGrid, RotateCcw, Sparkles
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Services', icon: LayoutGrid },
  { id: 'hospitals', label: 'Hospitals & ER', icon: Building2 },
  { id: 'pharmacies', label: '24/7 Pharmacies', icon: Pill },
  { id: 'blood-banks', label: 'Blood Banks', icon: Droplet },
  { id: 'ambulances', label: 'Ambulances', icon: Truck }
];

const RADIUS_PRESETS = [
  { label: '3 km', value: 3000 },
  { label: '5 km', value: 5000 },
  { label: '10 km', value: 10000 },
  { label: '20 km', value: 20000 },
  { label: '30 km', value: 30000 }
];

export default function SearchBar({ 
  searchQuery = '', 
  onSearchChange, 
  selectedCategory = 'all', 
  onCategoryChange,
  radius = 10000,
  onRadiusChange,
  onClear 
}) {
  const isFiltered = searchQuery.trim() !== '' || (selectedCategory && selectedCategory !== 'all') || radius !== 10000;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Search is reactive on change, but submit keeps accessibility and forms natural
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-xs space-y-3.5 transition-colors">
      
      {/* Primary Search Input Row */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-slate-500 group-focus-within:text-red-600 dark:group-focus-within:text-red-400 transition-colors">
            <Search className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search verified emergency hospitals, pharmacies, blood banks..."
            aria-label="Search emergency facilities"
            className="w-full bg-gray-50/80 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-500 focus:bg-white dark:focus:bg-slate-950 transition-colors font-normal"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 text-white text-xs sm:text-sm font-medium transition-all shadow-sm shadow-red-600/20 cursor-pointer shrink-0"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Find Services</span>
        </button>
      </form>

      {/* Interactive Category Filter Pills (Vercel/Geist Design) */}
      {onCategoryChange && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = (selectedCategory || 'all') === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors shrink-0 cursor-pointer font-medium text-xs border ${
                  isSelected
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-gray-50 dark:bg-slate-850 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-gray-500 dark:text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Radius Controls & Filter Management */}
      {onRadiusChange && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 px-0.5 text-xs text-gray-500 dark:text-slate-400 border-t border-gray-100 dark:border-slate-800">
          
          {/* Active Radius Indicator */}
          <div className="flex items-center gap-2 font-normal text-gray-600 dark:text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
            <span>Search Distance:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {(radius / 1000).toFixed(0)} km
            </span>
          </div>

          {/* Presets & Fine Slider */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-850 p-0.5 rounded-lg border border-gray-200/80 dark:border-slate-800">
              {RADIUS_PRESETS.map((preset) => {
                const isActive = radius === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => onRadiusChange(preset.value)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <input
              type="range"
              min="1000"
              max="35000"
              step="1000"
              value={radius}
              onChange={(e) => onRadiusChange(Number(e.target.value))}
              aria-label="Adjust radius slider"
              className="w-20 sm:w-28 accent-red-600 cursor-pointer h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg"
            />

            {isFiltered && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 px-2 py-1 rounded-md transition-colors cursor-pointer ml-1"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
