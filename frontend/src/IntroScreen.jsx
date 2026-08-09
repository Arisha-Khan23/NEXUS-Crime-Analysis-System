import { useState, useEffect } from 'react';

const lines = [
  '> NEXUS CRIME ANALYSIS SYSTEM v2.4.1',
  '> Initializing secure connection...',
  '> Loading criminal database...',
  '> Calibrating threat assessment matrix...',
  '> Establishing geospatial feed...',
  '> All systems nominal.',
  '> ACCESS GRANTED — WELCOME, AGENT.',
];

export default function IntroScreen({ onComplete }) {
  const [displayed, setDisplayed] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setDisplayed(prev => [...prev, lines[i]]);
        setProgress(Math.round(((i + 1) / lines.length) * 100));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#050508',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', zIndex: 9000,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '3rem', fontWeight: 900, color: '#ff003c', textShadow: '0 0 30px #ff003c', letterSpacing: '0.3em' }}>NEXUS</div>
        <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.75rem', color: '#6b7a8d', letterSpacing: '0.4em' }}>CRIME ANALYSIS SYSTEM</div>
      </div>

      {/* Terminal */}
      <div style={{ width: '500px', maxWidth: '90vw', background: '#0a0a0f', border: '1px solid #1a1a2e', borderRadius: 4, padding: '1.5rem' }}>
        {displayed.map((line, i) => (
          <div key={i} style={{
            fontFamily: 'Share Tech Mono,monospace', fontSize: '0.8rem',
color: line?.includes('GRANTED') ? '#00ff88' : line?.includes('ERROR') ? '#ff003c' : '#c8d6e5',            marginBottom: '0.4rem',
textShadow: line?.includes('GRANTED') ? '0 0 8px #00ff88' : 'none',
          }}>
            {line}
          </div>
        ))}
        {displayed.length < lines.length && (
          <span style={{ fontFamily: 'Share Tech Mono,monospace', color: '#ff003c', animation: 'blink 1s infinite' }}>█</span>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ width: '500px', maxWidth: '90vw', marginTop: '1rem' }}>
        <div style={{ background: '#0a0a0f', border: '1px solid #1a1a2e', height: 4, borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#ff003c', boxShadow: '0 0 8px #ff003c', transition: 'width 0.3s', borderRadius: 2 }} />
        </div>
        <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '0.7rem', color: '#6b7a8d', marginTop: '0.5rem', textAlign: 'right' }}>{progress}%</div>
      </div>
    </div>
  );
}