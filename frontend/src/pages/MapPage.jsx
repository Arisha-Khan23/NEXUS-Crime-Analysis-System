import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import axios from 'axios';
import AlertSystem from '../components/AlertSystem.jsx';

const severityColor = {
  Critical: '#ff003c',
  High: '#ff8800',
  Medium: '#ffd500',
  Low: '#00ff88',
};

function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const heatPoints = points.map(p => {
  let intensity = 1;

  if (p.severity === "Critical") intensity = 3;
  else if (p.severity === "High") intensity = 2;
  else if (p.severity === "Medium") intensity = 1.5;

  return [p.lat, p.lng, intensity];
});

    const heatLayer = L.heatLayer(heatPoints, {
  radius: 60,
  blur: 30,
  maxZoom: 18,
  minOpacity: 0.6
});
    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [points, map]);

  return null;
}

function FlyToLocation({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13);
    }
  }, [position, map]);

  return null;
}

export default function MapPage() {
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/crimes')
      .then(res => {
        setCrimes(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
  if (!navigator.geolocation) return;

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      setUserLocation([
        position.coords.latitude,
        position.coords.longitude,
      ]);
    },
    (error) => {
      console.error('Location error:', error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000,
    }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}, []);

  if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading crime data...</div>;
  if (error) return <div style={{ color: 'red', padding: '2rem' }}>Error loading data: {error}</div>;

  return (
  <div style={{ height: '90vh', width: '100%', position: 'relative' }}>
    <AlertSystem crimes={crimes} />
      <MapContainer
  center={userLocation || [34.0151, 71.5249]}
  zoom={13}
  style={{ height: '100%', width: '100%' }}
>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {userLocation && <FlyToLocation position={userLocation} />}

        <HeatmapLayer points={crimes} />

        {userLocation && (
  <CircleMarker
    center={userLocation}
    radius={12}
    pathOptions={{
      color: '#0066ff',
      fillColor: '#0066ff',
      fillOpacity: 1,
      weight: 3,
    }}
  >
    <Popup>
      <strong>You are here</strong>
      <br />
      Live GPS Location
    </Popup>
  </CircleMarker>
)}

        {crimes.map(crime => (
          <CircleMarker
            key={crime._id}
            center={[crime.lat, crime.lng]}
            radius={6}
            pathOptions={{
              color: severityColor[crime.severity] || '#c8d6e5',
              fillColor: severityColor[crime.severity] || '#c8d6e5',
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <strong>{crime.type}</strong><br />
              Location: {crime.location}<br />
              Severity: {crime.severity}<br />
              Status: {crime.status}<br />
              Date: {new Date(crime.date).toLocaleDateString()}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}