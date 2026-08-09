import AlertSystem from '../components/AlertSystem.jsx';
import { useEffect, useState } from 'react';
import axios from 'axios';

const contacts = [
  {
    label: 'National Emergency Helpline',
    number: '911',
    desc: 'Unified police, fire, ambulance, motorway police',
  },
  {
    label: 'Police',
    number: '15',
    desc: 'Police Madadgar — crime, accidents, immediate assistance',
  },
  {
    label: 'Rescue / Emergency Services',
    number: '1122',
    desc: 'Punjab Emergency Service — rescue, fire, medical response',
  },
  {
    label: 'Edhi Ambulance',
    number: '115',
    desc: 'Nationwide ambulance service',
  },
  {
    label: 'Fire Brigade',
    number: '16',
    desc: 'Fire emergencies',
  },
];

const cardStyle = {
  background: '#0a0a0f',
  border: '1px solid #1a1a2e',
  borderRadius: 8,
  padding: '1.2rem',
};

export default function Emergency() {
  const [crimes, setCrimes] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/crimes')
      .then((res) => setCrimes(res.data.data || []))
      .catch(() => setCrimes([]));
  }, []);

  return (
    <div
      style={{
        padding: '2rem',
        background: '#050508',
        minHeight: '90vh',
        fontFamily: 'Share Tech Mono, monospace',
        position: 'relative',
      }}
    >
      <h1
        style={{
          fontFamily: 'Orbitron, sans-serif',
          color: '#ff003c',
          letterSpacing: '0.1em',
          textShadow: '0 0 20px rgba(255,0,60,0.5)',
          marginBottom: '0.3rem',
          fontSize: '1.6rem',
        }}
      >
        EMERGENCY RESPONSE
      </h1>

      <div
        style={{
          color: '#6b7a8d',
          fontSize: '0.75rem',
          marginBottom: '2rem',
        }}
      >
        IF YOU ARE IN IMMEDIATE DANGER, CALL A NUMBER BELOW BEFORE DOING
        ANYTHING ELSE
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        {/* Emergency contacts */}
        <div style={{ flex: '1 1 380px' }}>
          <div
            style={{
              color: '#6b7a8d',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              marginBottom: '0.8rem',
              textTransform: 'uppercase',
            }}
          >
            Emergency Contacts — Pakistan
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
            }}
          >
            {contacts.map((c) => (
              <a
                key={c.number}
                href={`tel:${c.number}`}
                style={{
                  ...cardStyle,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textDecoration: 'none',
                  transition: 'border 0.2s',
                }}
              >
                <div>
                  <div
                    style={{
                      color: '#c8d6e5',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                    }}
                  >
                    {c.label}
                  </div>

                  <div
                    style={{
                      color: '#6b7a8d',
                      fontSize: '0.7rem',
                      marginTop: 2,
                    }}
                  >
                    {c.desc}
                  </div>
                </div>

                <div
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: '#ff003c',
                    textShadow: '0 0 10px rgba(255,0,60,0.5)',
                  }}
                >
                  {c.number}
                </div>
              </a>
            ))}
          </div>

          <div
            style={{
              color: '#3a4555',
              fontSize: '0.65rem',
              marginTop: '1rem',
            }}
          >
            Tap a number to call directly from a mobile device.
          </div>
        </div>

        {/* Threat scanner */}
        <div
          style={{
            flex: '1 1 320px',
            position: 'relative',
            minHeight: 400,
          }}
        >
          <div
            style={{
              color: '#6b7a8d',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              marginBottom: '0.8rem',
              textTransform: 'uppercase',
            }}
          >
            Area Threat Scanner
          </div>

          <div style={{ position: 'relative' }}>
            <AlertSystem crimes={crimes} embedded />
          </div>
        </div>
      </div>
    </div>
  );
}