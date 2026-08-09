import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar.jsx';
import IntroScreen from './IntroScreen.jsx';
import MapPage from './pages/MapPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Vault from './pages/Vault.jsx';
import Emergency from './pages/Emergency.jsx';

function App() {
  const [introDone, setIntroDone] = useState(false);
  const [dbStatus, setDbStatus] = useState('DISCONNECTED');

  useEffect(() => {
    axios.get('http://localhost:5000/health')
      .then(res => setDbStatus(res.data.database))
      .catch(() => setDbStatus('DISCONNECTED'));
  }, []);

  if (!introDone) {
    return <IntroScreen onComplete={() => setIntroDone(true)} />;
  }

  return (
    <BrowserRouter>
      <Navbar dbStatus={dbStatus} />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/database" element={<Vault />} />
        <Route path="/emergency" element={<Emergency />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;