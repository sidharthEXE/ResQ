import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import UseLocationButton from '../components/UseLocationButton';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function RegisterDonorPage() {
  const { location, requestLocation } = useLocation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bloodGroup: 'O+',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      setError('Please click "Use My Location" below so emergency seekers can find you.');
      requestLocation();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lat: location.lat,
          lng: location.lng
        })
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || (data.details ? data.details.map((d) => d.message).join(', ') : 'Failed to register');
        throw new Error(errorMsg);
      }

      navigate('/donors?registered=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-16">
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-medium text-gray-900 dark:text-white">Register as Donor</h1>
            <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm font-normal">Join the emergency community to save lives in real-time</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs font-normal">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-normal text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 min-h-[42px] text-gray-900 dark:text-white text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500/20 outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-slate-500 font-normal"
              placeholder="e.g. Rahul Sen"
            />
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Direct Phone / WhatsApp</label>
            <input 
              type="tel" 
              required
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 min-h-[42px] text-gray-900 dark:text-white text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500/20 outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-slate-500 font-normal"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Blood Group</label>
            <div className="grid grid-cols-4 gap-2">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                <button
                  type="button"
                  key={group}
                  onClick={() => setFormData({...formData, bloodGroup: group})}
                  className={`py-2 rounded-xl text-xs transition-colors border cursor-pointer ${
                    formData.bloodGroup === group
                      ? 'bg-red-600 text-white border-red-600 font-medium shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-750 font-normal'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-normal text-gray-500 dark:text-slate-400 uppercase tracking-wider">Live Location</label>
              <span className="text-[11px] text-gray-500 dark:text-slate-400 font-normal">Coordinates Obfuscated for Privacy</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-3 font-normal">Your exact GPS coordinates are obfuscated for your privacy. Searchers only see your approximate distance.</p>
            <UseLocationButton className="w-full min-h-[42px]" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 mt-6 py-3 px-4 min-h-[44px] rounded-xl text-xs font-medium tracking-wider uppercase bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Registering Donor...' : 'Confirm Registration'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
