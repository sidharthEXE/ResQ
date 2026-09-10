import L from 'leaflet';

/**
 * High-definition, razor-sharp vector SVG icons for emergency facilities.
 * Uses bold, filled shapes and high-contrast geometry to eliminate any fog/blurriness.
 */
const SVG_ICONS = {
  // Bold International Hospital "H" Emblem (No plus / cross)
  hospital: `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M6 3.5A1.5 1.5 0 0 1 7.5 2h2A1.5 1.5 0 0 1 11 3.5V9h2V3.5A1.5 1.5 0 0 1 14.5 2h2A1.5 1.5 0 0 1 18 3.5v17a1.5 1.5 0 0 1-1.5 1.5h-2a1.5 1.5 0 0 1-1.5-1.5V12h-2v8.5a1.5 1.5 0 0 1-1.5 1.5h-2a1.5 1.5 0 0 1-1.5-1.5V3.5z" 
        fill="#ffffff"
      />
    </svg>
  `,

  // Bold Medical Capsule Pill (high-contrast dual tone)
  pharmacy: `
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z" 
        fill="#ffffff" 
        fill-opacity="0.3" 
        stroke="#ffffff" 
        stroke-width="2.4" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M8.5 8.5l7 7" 
        stroke="#ffffff" 
        stroke-width="2.4" 
        stroke-linecap="round"
      />
      <path 
        d="M10.5 20.5l3.5-3.5-7-7-3.5 3.5a4.95 4.95 0 0 0 7 7z" 
        fill="#ffffff"
      />
    </svg>
  `,

  // Solid White Droplet with sleek crescent shine (No plus)
  blood_bank: `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M12 2.5C12 2.5 5 10.5 5 15.5A7 7 0 0 0 19 15.5C19 10.5 12 2.5 12 2.5Z" 
        fill="#ffffff"
      />
      <circle cx="10" cy="13.5" r="1.5" fill="#f43f5e" />
      <path 
        d="M14.5 13a4 4 0 0 1-1.5 3.5" 
        stroke="#f43f5e" 
        stroke-width="2" 
        stroke-linecap="round"
      />
    </svg>
  `,

  // Emergency Response Ambulance with Flashing Siren (No plus)
  ambulance: `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M10 17h4V5H2v12h3" 
        stroke="#ffffff" 
        stroke-width="2.2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" 
        stroke="#ffffff" 
        stroke-width="2.2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <circle cx="7.5" cy="17.5" r="2.5" fill="#ffffff"/>
      <circle cx="17.5" cy="17.5" r="2.5" fill="#ffffff"/>
      <path 
        d="M6 10h5" 
        stroke="#ffffff" 
        stroke-width="2.2" 
        stroke-linecap="round"
      />
      <path 
        d="M7 2.5l1 1.5m4-1.5l-1 1.5" 
        stroke="#ffffff" 
        stroke-width="1.8" 
        stroke-linecap="round"
      />
    </svg>
  `
};

const CATEGORY_CONFIG = {
  hospitals: { 
    topColor: '#ef4444', 
    bottomColor: '#b91c1c', 
    glowColor: 'rgba(239, 68, 68, 0.4)',
    icon: SVG_ICONS.hospital, 
    label: 'Hospital' 
  },
  hospital: { 
    topColor: '#ef4444', 
    bottomColor: '#b91c1c', 
    glowColor: 'rgba(239, 68, 68, 0.4)',
    icon: SVG_ICONS.hospital, 
    label: 'Hospital' 
  },
  pharmacies: { 
    topColor: '#10b981', 
    bottomColor: '#047857', 
    glowColor: 'rgba(16, 185, 129, 0.4)',
    icon: SVG_ICONS.pharmacy, 
    label: 'Pharmacy' 
  },
  pharmacy: { 
    topColor: '#10b981', 
    bottomColor: '#047857', 
    glowColor: 'rgba(16, 185, 129, 0.4)',
    icon: SVG_ICONS.pharmacy, 
    label: 'Pharmacy' 
  },
  'blood-banks': { 
    topColor: '#f43f5e', 
    bottomColor: '#9f1239', 
    glowColor: 'rgba(244, 63, 94, 0.4)',
    icon: SVG_ICONS.blood_bank, 
    label: 'Blood Bank' 
  },
  blood_bank: { 
    topColor: '#f43f5e', 
    bottomColor: '#9f1239', 
    glowColor: 'rgba(244, 63, 94, 0.4)',
    icon: SVG_ICONS.blood_bank, 
    label: 'Blood Bank' 
  },
  ambulances: { 
    topColor: '#f59e0b', 
    bottomColor: '#b45309', 
    glowColor: 'rgba(245, 158, 11, 0.4)',
    icon: SVG_ICONS.ambulance, 
    label: 'Ambulance' 
  },
  ambulance: { 
    topColor: '#f59e0b', 
    bottomColor: '#b45309', 
    glowColor: 'rgba(245, 158, 11, 0.4)',
    icon: SVG_ICONS.ambulance, 
    label: 'Ambulance' 
  }
};

const pinCache = new Map();

/**
 * Creates or retrieves a cached Leaflet DivIcon with razor-sharp vector graphics.
 * Designed with a clean teardrop pin, crisp white border, and bold white fill.
 */
export function getMapPinIcon(category, isSelected = false) {
  const cacheKey = `${category}-${isSelected ? 'sel' : 'def'}`;
  if (pinCache.has(cacheKey)) {
    return pinCache.get(cacheKey);
  }

  const config = CATEGORY_CONFIG[category] || {
    topColor: '#0284c7',
    bottomColor: '#0369a1',
    glowColor: 'rgba(2, 132, 199, 0.4)',
    icon: SVG_ICONS.hospital,
    label: 'Emergency Service'
  };

  const size = isSelected ? 40 : 34;
  const totalHeight = size + 7;
  const shadow = isSelected
    ? '0 8px 16px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.2)'
    : '0 4px 8px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15)';

  const icon = L.divIcon({
    className: 'resq-leaflet-marker',
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${totalHeight}px;
        display: flex;
        flex-direction: column;
        align-items: center;
        filter: drop-shadow(${shadow});
        transform: translateY(${isSelected ? '-4px' : '0'});
        cursor: pointer;
        transition: transform 0.18s ease;
      ">
        <!-- Main Circular Badge with Vibrant Gradient & Crisp White Border -->
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: linear-gradient(145deg, ${config.topColor} 0%, ${config.bottomColor} 100%);
          border: 2.5px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.4);
          z-index: 2;
        ">
          ${config.icon}
        </div>

        <!-- Crisp Tapered SVG Arrow Pointer (Eliminates blurry sub-pixel antialiasing) -->
        <svg 
          width="12" 
          height="8" 
          viewBox="0 0 12 8" 
          style="margin-top: -1.5px; z-index: 1; display: block;"
        >
          <path d="M0 0 L12 0 L6 8 Z" fill="${config.bottomColor}" />
        </svg>

        <!-- Selected State Animated Ping Ring -->
        ${
          isSelected
            ? `<div style="
                position: absolute;
                top: -4px;
                left: -4px;
                width: ${size + 8}px;
                height: ${size + 8}px;
                border-radius: 50%;
                border: 2.5px solid ${config.topColor};
                animation: resq-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
                pointer-events: none;
              "></div>`
            : ''
        }
      </div>
    `,
    iconSize: [size, totalHeight],
    iconAnchor: [size / 2, totalHeight],
    popupAnchor: [0, -totalHeight + 4]
  });

  pinCache.set(cacheKey, icon);
  return icon;
}

/**
 * User location radar marker with sleek pulse ring.
 */
export const userLocationIcon = L.divIcon({
  className: 'resq-user-marker',
  html: `
    <div style="
      position: relative;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(2, 132, 199, 0.3);
      "></div>
      <div style="
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #0284c7;
        border: 2.5px solid #ffffff;
        box-shadow: 0 2px 8px rgba(2, 132, 199, 0.6);
      "></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});
