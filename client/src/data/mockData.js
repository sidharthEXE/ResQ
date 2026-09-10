/**
 * MOCK DATA SOURCE FOR EMERGENCY FINDER MVP
 * Explicitly labeled sample dataset representing emergency service places.
 */

export const MOCK_CATEGORIES = [
  {
    id: 'hospitals',
    title: 'Hospitals & ER',
    route: '/hospitals',
    iconName: 'Building2',
    count: '24 Available',
    description: '24/7 Trauma centers, emergency wards & specialized care',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
    accentColor: 'bg-red-600',
    iconBg: 'bg-red-50 text-red-600 border border-red-100'
  },
  {
    id: 'pharmacies',
    title: '24/7 Pharmacies',
    route: '/pharmacies',
    iconName: 'Pill',
    count: '18 Open Now',
    description: 'Round-the-clock prescription drugs & medical supplies',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentColor: 'bg-emerald-600',
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100'
  },
  {
    id: 'blood-banks',
    title: 'Blood Banks',
    route: '/blood-banks',
    iconName: 'Droplet',
    count: '9 Stocked',
    description: 'Real-time blood stock availability & emergency donor units',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    accentColor: 'bg-rose-600',
    iconBg: 'bg-rose-50 text-rose-600 border border-rose-100'
  },
  {
    id: 'ambulances',
    title: 'Ambulance Services',
    route: '/ambulances',
    iconName: 'Truck',
    count: '12 Active Units',
    description: 'ALS & BLS rapid response fleets for critical transport',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    accentColor: 'bg-amber-600',
    iconBg: 'bg-amber-50 text-amber-600 border border-amber-100'
  }
];

export const MOCK_PLACES = [
  {
    id: 'hosp-1',
    name: 'City Care Trauma & Super Specialty Hospital',
    category: 'hospitals',
    categoryLabel: 'Hospital',
    rating: 4.8,
    reviewsCount: 312,
    distanceKm: 0.8,
    formattedDistance: '0.8 km',
    address: '42 Emergency Blvd, Sector 4, Central District',
    phone: '+1 (555) 019-2834',
    emergencyHelpline: '112',
    is24x7: true,
    openingHours: 'Open 24/7 (Emergency Ward Active)',
    lat: 28.6139,
    lng: 77.2090,
    services: ['ICU', 'Trauma Center', 'Cardiac Emergency', 'Ambulance Dock'],
    isVerified: true
  },
  {
    id: 'hosp-2',
    name: 'St. Jude Memorial Children & General Hospital',
    category: 'hospitals',
    categoryLabel: 'Hospital',
    rating: 4.6,
    reviewsCount: 189,
    distanceKm: 1.4,
    formattedDistance: '1.4 km',
    address: '108 Health Park Way, Near Metro Line 2',
    phone: '+1 (555) 019-4821',
    emergencyHelpline: '112',
    is24x7: true,
    openingHours: 'Open 24/7',
    lat: 28.6250,
    lng: 77.2150,
    services: ['Pediatric ER', 'Maternity Ward', 'Blood Bank Onsite'],
    isVerified: true
  },
  {
    id: 'pharm-1',
    name: 'Apollo 24/7 Medicos & Surgical Supply',
    category: 'pharmacies',
    categoryLabel: 'Pharmacy',
    rating: 4.9,
    reviewsCount: 420,
    distanceKm: 0.4,
    formattedDistance: '400 m',
    address: '15 Main Plaza, Ground Floor, Central Market',
    phone: '+1 (555) 019-7712',
    emergencyHelpline: '112',
    is24x7: true,
    openingHours: 'Open 24/7',
    lat: 28.6110,
    lng: 77.2060,
    services: ['Prescription Fill', 'Oxygen Cylinders', 'First Aid Kits'],
    isVerified: true
  },
  {
    id: 'pharm-2',
    name: 'Wellness Pharmacy & Emergency Drugs',
    category: 'pharmacies',
    categoryLabel: 'Pharmacy',
    rating: 4.5,
    reviewsCount: 94,
    distanceKm: 1.9,
    formattedDistance: '1.9 km',
    address: '88 North Avenue, Opposite Metro Gate 3',
    phone: '+1 (555) 019-3382',
    emergencyHelpline: '112',
    is24x7: false,
    openingHours: 'Mon-Sun: 7:00 AM - 11:30 PM',
    lat: 28.6280,
    lng: 77.2010,
    services: ['Diabetes Supplies', 'Home Delivery', 'Vaccinations'],
    isVerified: false
  },
  {
    id: 'blood-1',
    name: 'Red Cross Regional Central Blood Bank',
    category: 'blood-banks',
    categoryLabel: 'Blood Bank',
    rating: 4.9,
    reviewsCount: 510,
    distanceKm: 1.1,
    formattedDistance: '1.1 km',
    address: 'Disaster Relief Building, 3rd Block, Civic Center',
    phone: '+1 (555) 019- blood (2566)',
    emergencyHelpline: '104',
    is24x7: true,
    openingHours: '24/7 Emergency Blood Stock Dispatch',
    lat: 28.6180,
    lng: 77.2180,
    services: ['Whole Blood', 'Platelets', 'Plasma Transfusion'],
    bloodInventory: {
      'A+': 'Available',
      'B+': 'Available',
      'O+': 'Available',
      'O-': 'Critical Stock (1 Unit Left)',
      'AB+': 'Available',
      'A-': 'Limited'
    },
    isVerified: true
  },
  {
    id: 'amb-1',
    name: 'National Emergency ALS Ambulance Network',
    category: 'ambulances',
    categoryLabel: 'Ambulance',
    rating: 4.9,
    reviewsCount: 680,
    distanceKm: 0.6,
    formattedDistance: '600 m',
    address: 'Station Dispatch Hub #4, Central Bypass',
    phone: '102',
    emergencyHelpline: '112',
    is24x7: true,
    openingHours: '24/7 Rapid Dispatch (Avg response: 8 mins)',
    lat: 28.6150,
    lng: 77.2020,
    services: ['Ventilator Ambulance', 'Cardiac Monitor', 'Paramedic Team'],
    fleetType: 'Advanced Life Support (ALS)',
    isVerified: true
  }
];

export const MOCK_HELPLINES = [
  { label: 'Universal Emergency', number: '112', color: 'bg-red-600' },
  { label: 'Ambulance Dispatch', number: '102', color: 'bg-amber-600' },
  { label: 'Blood Helpline', number: '104', color: 'bg-rose-600' }
];
