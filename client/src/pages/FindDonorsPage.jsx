import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import UseLocationButton from '../components/UseLocationButton';
import { Search, Droplet, Phone, MapPin, Loader2, CheckCircle } from 'lucide-react';

export default function FindDonorsPage() {
  const { location } = useLocation();
  const [searchParams] = useSearchParams();
  const isNewlyRegistered = searchParams.get('registered') === 'true';

  const [bloodGroup, setBloodGroup] = useState('O+');
  const [radiusKm, setRadiusKm] = useState(10);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!location) {
      setError('Please enable location to find nearby donors.');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/donors/search?bloodGroup=${encodeURIComponent(bloodGroup)}&lat=${location.lat}&lng=${location.lng}&radiusKm=${radiusKm}`);
      if (!res.ok) {
        throw new Error('Failed to fetch donors');
      }
      const data = await res.json();
      setDonors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {isNewlyRegistered && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="font-normal text-sm">Thank you! You are successfully registered as a blood donor.</p>
        </div>
      )}

      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-normal mb-3">
            <Droplet className="w-3.5 h-3.5" />
            <span>Community Donor Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-gray-900 dark:text-white">Find Blood Donors</h1>
          <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm mt-1 font-normal">Locate verified voluntary blood donors ready for immediate emergency transfusion.</p>
        </div>
        
        <form onSubmit={handleSearch} className="space-y-5">
          <div>
            <label className="block text-xs font-normal text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              Select Blood Group
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                <button
                  type="button"
                  key={group}
                  onClick={() => setBloodGroup(group)}
                  className={`py-2 rounded-xl text-xs transition-colors border cursor-pointer ${
                    bloodGroup === group
                      ? 'bg-red-600 text-white border-red-600 font-medium shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-750 font-normal'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-2">
            <div>
              <div className="flex justify-between items-center text-xs font-normal text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <span>Search Radius</span>
                <span className="text-red-600 dark:text-red-400 font-medium">{radiusKm} km</span>
              </div>
              <input 
                type="range"
                min="2"
                max="50"
                value={radiusKm}
                onChange={e => setRadiusKm(e.target.value)}
                className="w-full accent-red-600 cursor-pointer h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-xs font-medium tracking-wider uppercase bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 min-h-[42px] cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{loading ? 'Scanning Donors...' : 'Search Donors Nearby'}</span>
            </button>
          </div>
        </form>

        {!location && (
          <div className="pt-2">
             <UseLocationButton className="w-full min-h-[42px]" />
          </div>
        )}
      </div>

      {/* Results Section */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs font-normal">
          {error}
        </div>
      )}

      {hasSearched && !loading && !error && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Droplet className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>{donors.length} Verified Donors Found</span>
            </h2>
            <span className="text-xs font-normal text-gray-500 dark:text-slate-400">Blood Group {bloodGroup}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {donors.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-center col-span-full space-y-2">
                <p className="text-gray-700 dark:text-slate-300 font-medium text-sm">No donors found with blood group {bloodGroup} within {radiusKm}km.</p>
                <p className="text-gray-500 dark:text-slate-400 text-xs font-normal">Try increasing the radius slider or registering as a donor to help your local community.</p>
              </div>
            ) : (
              donors.map(donor => (
                <div key={donor.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 card-hover flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white text-base">{donor.name}</h3>
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 text-xs mt-1 font-normal">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                          <span>Approx. {donor.formattedDistance || 'Nearby'}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-full">
                        {donor.bloodGroup}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-normal text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Available to Donate
                    </span>
                    <a
                      href={`tel:${donor.phone}`}
                      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Contact</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
