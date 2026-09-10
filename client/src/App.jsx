import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LocationProvider } from './context/LocationContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import DevLocationPanel from './components/DevLocationPanel';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import PlaceDetailsPage from './pages/PlaceDetailsPage';
import RegisterDonorPage from './pages/RegisterDonorPage';
import FindDonorsPage from './pages/FindDonorsPage';
import EmergencyModePage from './pages/EmergencyModePage';

export default function App() {
  return (
    <ThemeProvider>
      <LocationProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans selection:bg-red-500 selection:text-white relative overflow-x-hidden">
            {/* Navigation Bar */}
            <Navbar />

            {/* Route Views Container */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/hospitals" element={<CategoryPage categoryId="hospitals" />} />
                <Route path="/pharmacies" element={<CategoryPage categoryId="pharmacies" />} />
                <Route path="/blood-banks" element={<CategoryPage categoryId="blood-banks" />} />
                <Route path="/ambulances" element={<CategoryPage categoryId="ambulances" />} />
                <Route path="/place/:id" element={<PlaceDetailsPage />} />
                <Route path="/register-donor" element={<RegisterDonorPage />} />
                <Route path="/donors" element={<FindDonorsPage />} />
                <Route path="/emergency" element={<EmergencyModePage />} />

                {/* Catch-all fallback */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>

            {/* Development-Only Location Panel */}
            <DevLocationPanel />

            {/* Global Footer */}
            <footer className="bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800/80 py-6 text-center text-xs text-gray-500 dark:text-gray-400 font-normal transition-colors">
              <p>© 2026 ResQ — Emergency Response & Service Locator. Built for rapid emergency service discovery.</p>
            </footer>
          </div>
        </BrowserRouter>
      </LocationProvider>
    </ThemeProvider>
  );
}
