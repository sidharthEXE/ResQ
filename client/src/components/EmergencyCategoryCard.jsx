import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Pill, Droplet, Truck, ArrowUpRight } from 'lucide-react';

const ICON_MAP = {
  Building2,
  Pill,
  Droplet,
  Truck
};

function EmergencyCategoryCard({ category }) {
  const IconComponent = ICON_MAP[category.iconName] || Building2;

  return (
    <Link
      to={category.route}
      className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 card-hover shadow-xs transition-colors duration-150"
    >
      <div>
        {/* Header Icon & Status Count Pill */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
            <IconComponent className="w-5 h-5" />
          </div>

          <span className="px-2.5 py-0.5 text-[11px] font-normal rounded-full bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
            {category.count}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors flex items-center justify-between">
          <span>{category.title}</span>
          <ArrowUpRight className="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150" />
        </h3>

        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-normal line-clamp-2">
          {category.description}
        </p>
      </div>

      {/* Subtle bottom line */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-normal text-gray-500 dark:text-slate-400">
        <span>Browse Nearest</span>
        <span className="text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150">View &rarr;</span>
      </div>
    </Link>
  );
}

export default React.memo(EmergencyCategoryCard);
