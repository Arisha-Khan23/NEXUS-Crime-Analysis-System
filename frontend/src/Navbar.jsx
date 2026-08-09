import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar({ dbStatus }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/database', label: 'The Vault' },
    { to: '/map', label: 'Crime Map' },
    { to: '/emergency', label: 'Emergency' },
  ];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(5,5,8,0.95)', borderBottom: '1px solid #1a1a2e',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', height: '56px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 8, height: 8, background: '#ff003c', borderRadius: '50%', boxShadow: '0 0 10px #ff003c', animation: 'pulse-red 2s infinite' }} />
        <span style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1rem', fontWeight: 700, color: '#ff003c', letterSpacing: '0.2em' }}>NEXUS</span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {links.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
            fontFamily: 'Orbitron,sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em',
            padding: '0.4rem 0.9rem', textDecoration: 'none', textTransform: 'uppercase',
            border: `1px solid ${isActive ? '#ff003c' : 'transparent'}`,
            color: isActive ? '#ff003c' : '#6b7a8d',
            background: isActive ? 'rgba(255,0,60,0.1)' : 'transparent',
            borderRadius: 2, transition: 'all 0.2s',
          })}>
            {label}
          </NavLink>
        ))}
      </div>

      {/* Status + Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: dbStatus === 'CONNECTED' ? '#00ff88' : '#ff003c', boxShadow: `0 0 6px ${dbStatus === 'CONNECTED' ? '#00ff88' : '#ff003c'}` }} />
          <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.65rem', color: '#6b7a8d' }}>
            DB:{dbStatus}
          </span>
        </div>
        <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.75rem', color: '#c8d6e5' }}>
          {time.toLocaleTimeString()}
        </span>
      </div>
    </nav>
  );
}