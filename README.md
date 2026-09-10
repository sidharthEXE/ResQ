# ResQ — Emergency Response & Service Locator

> 🚨 Real-time verified emergency medical services locator: hospitals, 24/7 pharmacies, blood bank stock, and emergency ambulance fleets within reach.

---

## 🌟 Key Features

- **Live Emergency Radar**: Instant geolocation tracking with automated proximity calculations.
- **Service Directory**:
  - 🏥 **Hospitals & Trauma Centers**: 24/7 ER availability, bed counts, emergency lines.
  - 💊 **24/7 Pharmacies**: Night delivery, verified open status, direct call lines.
  - 🩸 **Blood Banks & Donor Network**: Live blood group stock, nearby voluntary blood donors registry.
  - 🚑 **Ambulance Fleets**: ICU & BLS vehicle dispatch, arrival estimates.
- **SOS Emergency Mode**: High-contrast, one-tap crisis interface with SOS audio alarms and rapid helper notifications.
- **Interactive High-Performance Map**:
  - High-definition custom vector SVG pins.
  - Vercel/Geist frosted-glass map controls.
  - 100% free OpenStreetMap basemaps with **zero watermarks** and **zero API keys required**.
  - Optional support for **Ola Maps API** and **Google Maps API**.
- **Dark & Light Mode**: Butter-smooth, zero-lag theme toggle with persistent user preference.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React-Leaflet, Leaflet, Lucide Icons
- **Backend**: Node.js, Express, MongoDB / Mongoose, Node-Cache
- **Maps**: Leaflet with OpenStreetMap / CartoDB / Ola Maps / Google Maps SDK

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/sidharthEXE/ResQ.git
cd ResQ
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install client and server dependencies
npm --prefix client install
npm --prefix server install
```

### 3. Setup Environment Variables
```bash
# Frontend config (optional)
cp client/.env.example client/.env

# Backend config (optional)
cp server/.env.example server/.env
```

### 4. Run Development Servers
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 🗺️ Maps Configuration

ResQ works **100% out of the box** without any external map API keys.

If you have dedicated keys, you can optionally configure them in `client/.env`:
```env
# Optional: Google Maps JavaScript SDK
VITE_GOOGLE_MAPS_API_KEY=your_key_here

# Optional: Ola Maps API (India)
VITE_OLA_MAPS_API_KEY=your_key_here
```

---

## 📄 License
MIT License © 2026 ResQ.
