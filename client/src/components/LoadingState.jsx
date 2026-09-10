import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Scanning emergency grid...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 mb-3">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{message}</h4>
      <p className="text-xs text-gray-500 dark:text-slate-400 font-normal">Acquiring real-time location and nearest available services</p>
    </div>
  );
}
