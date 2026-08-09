import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = {
  Critical: '#ff003c',
  High: '#ff8800',
  Medium: '#ffd500',
  Low: '#00ff88',
};

const cardStyle = {
  background: '#0a0a0f',
  border: '1px solid #1a1a2e',
  borderRadius: 8,
  padding: '1.2rem',
  flex: 1,
  minWidth: 140,
};

const labelStyle = {
  fontFamily: 'Share Tech Mono, monospace',
  fontSize: '0.7rem',
  color: '#6b7a8d',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '0.4rem',
};

const valueStyle = {
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '2rem',
  fontWeight: 700,
  color: '#ff003c',
  textShadow: '0 0 12px rgba(255,0,60,0.5)',
};

function StatCard({ label, value, color }) {
  return (
    <div style={cardStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={{ ...valueStyle, color: color || '#ff003c', textShadow: `0 0 12px ${color || '#ff003c'}66` }}>
        {value}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#0a0a0f', border: '1px solid #ff003c', borderRadius: 4,
      padding: '0.5rem 0.8rem', color: '#c8d6e5',
      fontFamily: 'Share Tech Mono, monospace', fontSize: '0.75rem',
    }}>
      {payload[0].name}: <strong style={{ color: '#ff003c' }}>{payload[0].value}</strong>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/stats'),
      axios.get('http://localhost:5000/api/crimes'),
    ])
      .then(([statsRes, crimesRes]) => {
        setStats(statsRes.data.data);
        setCrimes(crimesRes.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading dashboard...</div>;
  if (error) return <div style={{ color: 'red', padding: '2rem' }}>Error loading data: {error}</div>;

  const severityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  crimes.forEach(c => {
    if (severityCounts[c.severity] !== undefined) severityCounts[c.severity]++;
  });
  const donutData = Object.entries(severityCounts)
    .map(([name, value]) => ({ name, value }))
    .filter(d => d.value > 0);

  const typeCounts = {};
  crimes.forEach(c => {
    typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
  });
  const barData = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const recentCrimes = [...crimes]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return (
    <div style={{
      padding: '2rem', background: '#050508', minHeight: '90vh',
      fontFamily: 'Share Tech Mono, monospace',
    }}>
      <h1 style={{
        fontFamily: 'Orbitron, sans-serif', color: '#ff003c', letterSpacing: '0.1em',
        textShadow: '0 0 20px rgba(255,0,60,0.5)', marginBottom: '1.5rem', fontSize: '1.6rem',
      }}>
        SYSTEM OVERVIEW
      </h1>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <StatCard label="Total Crimes" value={stats.totalCrimes} />
        <StatCard label="Active Cases" value={stats.activeCrimes} color="#ff8800" />
        <StatCard label="Total Criminals" value={stats.totalCriminals} color="#00ff88" />
        <StatCard label="Wanted" value={stats.wanted} color="#ff003c" />
        <StatCard label="Arrested" value={stats.arrested} color="#6b7a8d" />
        <StatCard label="Critical Threats" value={stats.critical} color="#ff003c" />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={{ ...cardStyle, flex: '1 1 320px', minHeight: 320 }}>
          <div style={labelStyle}>Crime Severity Breakdown</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                stroke="#050508"
                strokeWidth={2}
              >
                {donutData.map(entry => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {donutData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: '#c8d6e5' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[d.name], display: 'inline-block' }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...cardStyle, flex: '2 1 420px', minHeight: 320 }}>
          <div style={labelStyle}>Top Crime Types</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" horizontal={false} />
              <XAxis type="number" stroke="#6b7a8d" tick={{ fontSize: 11, fontFamily: 'Share Tech Mono, monospace' }} />
              <YAxis
                type="category"
                dataKey="type"
                stroke="#6b7a8d"
                width={140}
                tick={{ fontSize: 11, fontFamily: 'Share Tech Mono, monospace', fill: '#c8d6e5' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#ff003c" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Recent Incidents</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: '0.5rem' }}>
          {recentCrimes.map(crime => (
            <div key={crime._id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.6rem 0.8rem', background: '#050508', borderRadius: 4,
              borderLeft: `3px solid ${COLORS[crime.severity] || '#6b7a8d'}`,
            }}>
              <div>
                <div style={{ color: '#c8d6e5', fontSize: '0.85rem', fontWeight: 'bold' }}>{crime.type}</div>
                <div style={{ color: '#6b7a8d', fontSize: '0.7rem' }}>{crime.location}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: COLORS[crime.severity] || '#6b7a8d', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  {crime.severity}
                </div>
                <div style={{ color: '#6b7a8d', fontSize: '0.7rem' }}>
                  {new Date(crime.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}