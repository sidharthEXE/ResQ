import React from 'react';
import { Building2, Pill, Droplet, Truck, LayoutGrid } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Services', icon: LayoutGrid },
  { id: 'hospital', label: 'Hospitals', icon: Building2 },
  { id: 'pharmacy', label: 'Pharmacies', icon: Pill },
  { id: 'blood_bank', label: 'Blood Banks', icon: Droplet },
  { id: 'ambulance', label: 'Ambulances', icon: Truck },
];

export default function CategorySelector({ activeCategory, onSelectCategory }) {
  return (
    <div className="category-pills">
      {CATEGORIES.map((cat) => {
        const IconComponent = cat.icon;
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            className={`pill-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            <IconComponent size={15} />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
