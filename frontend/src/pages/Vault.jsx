import { useEffect, useState } from 'react';
import axios from 'axios';

const THREAT_COLORS = {
  Critical: '#ff003c',
  High: '#ff8800',
  Medium: '#ffd500',
  Low: '#00ff88',
};

const STATUS_COLORS = {
  Wanted: '#ff003c',
  Arrested: '#6b7a8d',
  'Under Surveillance': '#ffd500',
};

const inputStyle = {
  background: '#0a0a0f',
  border: '1px solid #1a1a2e',
  color: '#c8d6e5',
  padding: '0.5rem 0.8rem',
  borderRadius: 4,
  fontFamily: 'Share Tech Mono, monospace',
  fontSize: '0.8rem',
  outline: 'none',
};

export default function Vault() {
  const [criminals, setCriminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [threatLevel, setThreatLevel] = useState('');

  function fetchCriminals() {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (threatLevel) params.threatLevel = threatLevel;

    axios.get('http://localhost:5000/api/criminals', { params })
      .then(res => {
        setCriminals(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchCriminals();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCriminals();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, status, threatLevel]);

  return (
    <div style={{
      padding: '2rem', background: '#050508', minHeight: '90vh',
      fontFamily: 'Share Tech Mono, monospace',
    }}>
      <h1 style={{
        fontFamily: 'Orbitron, sans-serif', color: '#ff003c', letterSpacing: '0.1em',
        textShadow: '0 0 20px rgba(255,0,60,0.5)', marginBottom: '0.3rem', fontSize: '1.6rem',
      }}>
        THE VAULT
      </h1>
      <div style={{ color: '#6b7a8d', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
        CLASSIFIED CRIMINAL DATABASE — {criminals.length} RECORD{criminals.length !== 1 ? 'S' : ''} FOUND
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name or alias..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 240px' }}
        />
        <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
          <option value="">All Statuses</option>
          <option value="Wanted">Wanted</option>
          <option value="Arrested">Arrested</option>
          <option value="Under Surveillance">Under Surveillance</option>
        </select>
        <select value={threatLevel} onChange={e => setThreatLevel(e.target.value)} style={inputStyle}>
          <option value="">All Threat Levels</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {loading && <div style={{ color: '#6b7a8d' }}>Loading records...</div>}
      {error && <div style={{ color: '#ff003c' }}>Error: {error}</div>}

      {!loading && !error && criminals.length === 0 && (
        <div style={{ color: '#6b7a8d', padding: '2rem', textAlign: 'center' }}>
          No records match your search.
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.2rem',
      }}>
        {criminals.map(criminal => {
          const isExpanded = expandedId === criminal._id;
          const threatColor = THREAT_COLORS[criminal.threatLevel] || '#6b7a8d';
          const statusColor = STATUS_COLORS[criminal.status] || '#6b7a8d';

          return (
            <div
              key={criminal._id}
              onClick={() => setExpandedId(isExpanded ? null : criminal._id)}
              style={{
                background: '#0a0a0f',
                border: `1px solid ${isExpanded ? threatColor : '#1a1a2e'}`,
                borderRadius: 8,
                padding: '1.2rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isExpanded ? `0 0 20px ${threatColor}33` : 'none',
              }}
            >
              <div style={{
                width: '100%', height: 140, borderRadius: 6, marginBottom: '0.8rem',
                background: `linear-gradient(135deg, #1a1a2e, #0a0a0f)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${threatColor}44`,
              }}>
                <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '2.2rem', color: threatColor, opacity: 0.6 }}>
                  {criminal.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: '#c8d6e5', fontWeight: 'bold', fontSize: '0.95rem' }}>{criminal.name}</div>
                  <div style={{ color: threatColor, fontSize: '0.75rem', fontStyle: 'italic' }}>"{criminal.alias}"</div>
                </div>
                <div style={{
                  fontSize: '0.6rem', padding: '0.2rem 0.5rem', borderRadius: 3,
                  background: `${threatColor}22`, color: threatColor, border: `1px solid ${threatColor}66`,
                  fontWeight: 'bold', whiteSpace: 'nowrap',
                }}>
                  {criminal.threatLevel}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', fontSize: '0.7rem', color: '#6b7a8d' }}>
                <span>AGE {criminal.age}</span>
                <span>·</span>
                <span style={{ color: statusColor }}>{criminal.status}</span>
              </div>

              <div style={{ fontSize: '0.7rem', color: '#6b7a8d', marginTop: '0.4rem' }}>
                Last seen: {criminal.lastSeen}
              </div>

              <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                {criminal.crimes.map(crime => (
                  <span key={crime} style={{
                    fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 10,
                    background: '#1a1a2e', color: '#c8d6e5',
                  }}>
                    {crime}
                  </span>
                ))}
              </div>

              {isExpanded && (
                <div style={{
                  marginTop: '0.8rem', paddingTop: '0.8rem',
                  borderTop: '1px solid #1a1a2e', color: '#c8d6e5', fontSize: '0.75rem',
                  lineHeight: 1.5,
                }}>
                  {criminal.description}
                </div>
              )}

              <div style={{ fontSize: '0.6rem', color: '#3a4555', marginTop: '0.6rem', textAlign: 'center' }}>
                {isExpanded ? '▲ CLICK TO COLLAPSE' : '▼ CLICK FOR FULL FILE'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}