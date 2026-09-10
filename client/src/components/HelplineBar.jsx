import React from 'react';
import { ShieldAlert, Truck, Droplet } from 'lucide-react';

export default function HelplineBar() {
  return (
    <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-xl shadow-xs">
      <span className="text-[11px] font-normal text-gray-500 uppercase">
        Quick Dial:
      </span>

      <a href="tel:112" className="flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-normal rounded-lg">
        <ShieldAlert size={13} />
        <span>112 SOS</span>
      </a>

      <a href="tel:102" className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-normal rounded-lg">
        <Truck size={13} />
        <span>102 Ambulance</span>
      </a>

      <a href="tel:104" className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-normal rounded-lg">
        <Droplet size={13} />
        <span>104 Blood Helpline</span>
      </a>
    </div>
  );
}
