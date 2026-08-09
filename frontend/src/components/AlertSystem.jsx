import { useState, useRef, useEffect } from 'react';

const NEAR_THRESHOLD_KM = 2;
const HIGH_CRIME_COUNT = 10;

let sharedAudioCtx = null;
function getAudioContext() {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function playAlertSound(severe) {
  const ctx = getAudioContext();
  const pulseCount = severe ? 4 : 2;
  const baseFreq = severe ? 100 : 80;
  let time = ctx.currentTime;

  for (let i = 0; i < pulseCount; i++) {
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.type = 'sine';
    sub.frequency.setValueAtTime(baseFreq, time);
    sub.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, time + 0.5);
    subGain.gain.setValueAtTime(0, time);
    subGain.gain.linearRampToValueAtTime(0.8, time + 0.05);
    subGain.gain.linearRampToValueAtTime(0.7, time + 0.4);
    subGain.gain.linearRampToValueAtTime(0, time + 0.55);

    const edge = ctx.createOscillator();
    const edgeGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    edge.connect(filter);
    filter.connect(edgeGain);
    edgeGain.connect(ctx.destination);
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    edge.type = 'sawtooth';
    edge.frequency.setValueAtTime(baseFreq * 2, time);
    edge.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, time + 0.5);
    edgeGain.gain.setValueAtTime(0, time);
    edgeGain.gain.linearRampToValueAtTime(0.3, time + 0.05);
    edgeGain.gain.linearRampToValueAtTime(0.25, time + 0.4);
    edgeGain.gain.linearRampToValueAtTime(0, time + 0.55);
    sub.start(time);
    sub.stop(time + 0.55);
    edge.start(time);
    edge.stop(time + 0.55);
    time += 0.6;
  }
}

export default function AlertSystem({ crimes, embedded }) {
  const containerRef = useRef(null);
  const [placeQuery, setPlaceQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [geoError, setGeoError] = useState(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const stop = e => e.stopPropagation();
    el.addEventListener('keydown', stop);
    el.addEventListener('keyup', stop);
    el.addEventListener('keypress', stop);
    return () => {
      el.removeEventListener('keydown', stop);
      el.removeEventListener('keyup', stop);
      el.removeEventListener('keypress', stop);
    };
  }, []);

  function analyzeLocation(lat, lng) {
    let nearbyCount = 0;
    let nearestKm = Infinity;

    crimes.forEach(crime => {
      const d = getDistanceKm(lat, lng, crime.lat, crime.lng);
      if (d < nearestKm) nearestKm = d;
      if (d <= NEAR_THRESHOLD_KM) nearbyCount++;
    });

    let level = null;
    if (nearbyCount >= HIGH_CRIME_COUNT) level = 'high';
    else if (nearbyCount > 0) level = 'near';

    setResult({ level, nearbyCount, nearestKm });
    if (level) playAlertSound(level === 'high');
  }

  function useMyLocation() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => analyzeLocation(pos.coords.latitude, pos.coords.longitude),
      () => setGeoError('Location access denied. Use area search below.')
    );
  }

  async function searchPlace() {
    if (!placeQuery.trim()) {
      setGeoError('Enter an area or city name.');
      return;
    }
    setGeoError(null);
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeQuery)}&format=json&limit=1&countrycodes=pk`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (!data.length) {
        setGeoError('Area not found. Try a different name.');
        setSearching(false);
        return;
      }
      const { lat, lon } = data[0];
      analyzeLocation(parseFloat(lat), parseFloat(lon));
    } catch (err) {
      setGeoError('Search failed. Check your connection.');
    }
    setSearching(false);
  }

  return (
    <div ref={containerRef} style={{
      position: embedded ? 'relative' : 'absolute',
      top: embedded ? 0 : 70,
      left: embedded ? 0 : 10,
      zIndex: 1000,
      background: 'rgba(10,10,15,0.92)', border: '1px solid #1a1a2e',
      borderRadius: 6, padding: '1rem', width: 280, color: '#c8d6e5',
      fontFamily: 'Share Tech Mono, monospace', fontSize: '0.8rem',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#ff003c' }}>
        ⚠ AREA THREAT SCANNER
      </div>

      <button onClick={useMyLocation} style={{
        width: '100%', padding: '0.5rem', marginBottom: '0.5rem',
        background: '#1a1a2e', color: '#c8d6e5', border: '1px solid #ff003c',
        borderRadius: 4, cursor: 'pointer',
      }}>
        📍 Use My Location
      </button>

      <div style={{ display: 'flex', gap: 4, marginBottom: '0.5rem' }}>
        <input
          placeholder="Search area or city..."
          value={placeQuery}
          onChange={e => setPlaceQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchPlace()}
          style={{ flex: 1, padding: 4, background: '#0a0a0f', color: 'white', border: '1px solid #1a1a2e' }}
        />
        <button
          onClick={searchPlace}
          disabled={searching}
          style={{
            padding: '4px 8px', background: '#1a1a2e', color: '#ff003c',
            border: '1px solid #ff003c', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem',
          }}
        >
          {searching ? '...' : '🔍'}
        </button>
      </div>
      <div style={{ fontSize: '0.65rem', color: '#3a4555', marginBottom: '0.5rem' }}>
        e.g. "Lahore", "Saddar Karachi", "Blue Area Islamabad"
      </div>

      {geoError && <div style={{ color: '#ff8800', fontSize: '0.7rem' }}>{geoError}</div>}

      {result && (
        <div style={{
          marginTop: '0.5rem', padding: '0.6rem', borderRadius: 4,
          background: result.level === 'high' ? '#ff003c' : result.level === 'near' ? '#ff8800' : '#0a3d1f',
          color: 'white',
          animation: result.level ? 'pulse 1s infinite' : 'none',
        }}>
          {result.level === 'high' && '🚨 HIGH CRIME AREA DETECTED'}
          {result.level === 'near' && '⚠ HOTSPOT NEARBY'}
          {!result.level && '✓ NO IMMEDIATE THREAT'}
          <div style={{ fontSize: '0.7rem', marginTop: 4 }}>
            {result.nearbyCount} incident(s) within {NEAR_THRESHOLD_KM}km · nearest: {result.nearestKm.toFixed(2)}km
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 6px rgba(255,0,60,0.6); }
          50% { box-shadow: 0 0 20px rgba(255,0,60,1); }
        }
      `}</style>
    </div>
  );
}