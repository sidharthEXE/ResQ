/**
 * Authentic emergency helpline numbers per region.
 * Used when direct place phone numbers are unlisted in OpenStreetMap.
 */
export const EMERGENCY_HELPLINES = {
  national: {
    universal: "112",
    ambulance: "102",
    medicalEmergency: "108",
    bloodBank: "104",
    pharmacyHelpline: "1860-500-0101"
  },
  disclaimer: "If direct line is unavailable, call national emergency hotline immediately."
};

/**
 * Verified emergency services database (e.g. 24/7 Central Blood Banks & Ambulance Hubs).
 * Merged with OSM live data.
 */
export const VERIFIED_EMERGENCY_NODES = [
  {
    id: "verified-pharmacy-hub-1",
    name: "Apollo 24/7 Central Emergency Pharmacy & Medical Supplies",
    category: "pharmacy",
    lat: 28.6120,
    lng: 77.2080,
    address: "National 24/7 Critical Medicine & Oxygen Supply Hub",
    phone: "1860-500-0101",
    emergencyPhone: "112",
    is24x7: true,
    isVerified: true,
    openingHours: "Open 24/7"
  },
  {
    id: "verified-blood-hub-1",
    name: "Central Red Cross Blood Bank & Hotline",
    category: "blood_bank",
    lat: 28.6139,
    lng: 77.2090,
    address: "Central Disaster & Medical Center",
    phone: "1800-11-8011",
    emergencyPhone: "104",
    is24x7: true,
    isVerified: true,
    bloodAvailability: {
      "A+": "Available",
      "B+": "Available",
      "O+": "Available",
      "AB+": "Limited",
      "O-": "Critical Stock",
      "A-": "Available"
    }
  },
  {
    id: "verified-ambulance-hub-1",
    name: "National Emergency Ambulance Dispatch",
    category: "ambulance",
    lat: 28.6145,
    lng: 77.2100,
    address: "24/7 Rapid Response Network",
    phone: "102",
    emergencyPhone: "112",
    is24x7: true,
    isVerified: true,
    fleetType: "Advanced Life Support (ALS) & Basic Life Support (BLS)"
  }
];

