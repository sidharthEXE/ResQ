import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, Menu, X, Building2, Pill, 
  Droplet, Truck, Home, Search, Zap, HeartHandshake
} from 'lucide-react';
import UseLocationButton from './UseLocationButton';
import ThemeToggle from './ThemeToggle';
import ResQLogo from './ResQLogo';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const mainNavItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/hospitals', label: 'Hospitals', icon: Building2 },
    { path: '/pharmacies', label: 'Pharmacies', icon: Pill },
    { path: '/blood-banks', label: 'Blood Banks', icon: Droplet },
    { path: '/ambulances', label: 'Ambulances', icon: Truck },
    { path: '/donors', label: 'Find Donors', icon: Search },
    { path: '/register-donor', label: 'Donate', icon: HeartHandshake },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 py-2 transition-colors duration-150 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-15 gap-3">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center group shrink-0" aria-label="ResQ Home">
            <ResQLogo />
          </Link>

          {/* Desktop Navigation Center Pill Bar */}
          <nav className="hidden xl:flex items-center gap-1 p-1 rounded-xl bg-gray-100/80 dark:bg-slate-900/80 border border-gray-200/80 dark:border-slate-800">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 font-medium shadow-xs border border-gray-200/60 dark:border-slate-700'
                        : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-slate-800/60 font-normal'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Compact Navigation for Medium Screens */}
          <nav className="hidden md:flex xl:hidden items-center gap-1 p-1 rounded-lg bg-gray-100/80 dark:bg-slate-900/80 border border-gray-200/80 dark:border-slate-800">
            {mainNavItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 font-medium shadow-xs'
                        : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white font-normal'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <NavLink
              to="/donors"
              className={({ isActive }) =>
                `flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 font-medium shadow-xs'
                    : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white font-normal'
                }`
              }
            >
              <Search className="w-3.5 h-3.5" />
              <span>Donors</span>
            </NavLink>
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Dark/Light Mode Switcher */}
            <ThemeToggle />

            {/* GPS Location Button */}
            <UseLocationButton variant="compact" />

            {/* Emergency Mode Button */}
            <Link
              to="/emergency"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 min-h-[36px] rounded-xl text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20"
              aria-label="Emergency Mode"
            >
              <Zap className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline tracking-wider">EMERGENCY</span>
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 text-red-600" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 top-[57px] bg-black/40 z-40 md:hidden transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative z-50 md:hidden bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-4 shadow-xl animate-slide-down">
            
            {/* Quick Emergency Banner in Mobile Menu */}
            <Link
              to="/emergency"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3.5 rounded-xl bg-red-600 text-white shadow-md shadow-red-600/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium tracking-wide">ENTER EMERGENCY MODE</div>
                  <div className="text-[11px] text-red-100 font-normal">One-tap alerts & rapid response</div>
                </div>
              </div>
              <span className="text-xs font-normal bg-white/20 px-2 py-1 rounded-md">OPEN</span>
            </Link>

            {/* Mobile Theme Toggle Card */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">Appearance Theme</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">Light or dark interface mode</span>
              </div>
              <ThemeToggle />
            </div>

            {/* Category Links Grid */}
            <div className="space-y-1">
              <div className="text-[11px] font-normal uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1 pb-1">
                Emergency Services
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-normal transition-colors ${
                          isActive
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 font-medium'
                            : 'bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200/70 dark:border-slate-800'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Quick Speed Dial Hotlines */}
            <div className="pt-2 border-t border-gray-100 dark:border-slate-850">
              <div className="text-[11px] font-normal uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1 mb-2">
                Instant Helplines
              </div>
              <div className="grid grid-cols-4 gap-2">
                <a
                  href="tel:112"
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 transition-colors"
                >
                  <span className="text-xs font-medium text-gray-900 dark:text-white">112</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Universal</span>
                </a>
                <a
                  href="tel:102"
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 transition-colors"
                >
                  <span className="text-xs font-medium text-gray-900 dark:text-white">102</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Ambulance</span>
                </a>
                <a
                  href="tel:108"
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 transition-colors"
                >
                  <span className="text-xs font-medium text-gray-900 dark:text-white">108</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Disaster</span>
                </a>
                <a
                  href="tel:104"
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 transition-colors"
                >
                  <span className="text-xs font-medium text-gray-900 dark:text-white">104</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Blood</span>
                </a>
              </div>
            </div>

          </div>
        </>
      )}
    </header>
  );
}
