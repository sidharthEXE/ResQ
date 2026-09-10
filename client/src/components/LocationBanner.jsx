import React, { useState } from 'react';
import { MapPin, Navigation, Search, AlertTriangle } from 'lucide-react';

export default function LocationBanner({ 
  location, 
  locationError, 
  onRequestLocation, 
  onManualAddressSearch 
}) {
  const [addressInput, setAddressInput] = useState('');
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addressInput.trim()) return;

    setIsSearchingAddress(true);
    try {
      await onManualAddressSearch(addressInput);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  return (
    <div className="location-bar">
      <div className="location-info">
        <MapPin size={18} color="var(--accent-cyan)" />
        <div>
          {location ? (
            <>
              <strong>{location.addressName || 'Current GPS Location'}</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
              </span>
            </>
          ) : (
            <>
              <strong>{locationError ? 'Location Access Denied' : 'Acquiring GPS Signal...'}</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {locationError || 'Click button or enter address below'}
              </span>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button 
          className="btn-icon" 
          onClick={onRequestLocation} 
          title="Use My Current Location"
        >
          <Navigation size={16} color="var(--accent-cyan)" />
        </button>

        <form onSubmit={handleAddressSubmit} style={{ display: 'flex', gap: '0.3rem' }}>
          <input 
            type="text" 
            placeholder="Search city/locality..." 
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
              color: '#fff',
              padding: '0.35rem 0.6rem',
              fontSize: '0.78rem',
              width: '140px'
            }}
          />
          <button type="submit" className="btn-icon" disabled={isSearchingAddress}>
            <Search size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
