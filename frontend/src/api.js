import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Mock data fallback
const MOCK_CRIMINALS = [
    { _id: '1', name: 'Marcus Vega', alias: 'The Ghost', age: 38, status: 'Wanted', threatLevel: 'Critical', crimes: ['Armed Robbery', 'Murder'], lastSeen: 'Karachi, Pakistan', description: 'Highly dangerous — armed and unpredictable' },
    { _id: '2', name: 'Layla Hassan', alias: 'Serpent', age: 31, status: 'Arrested', threatLevel: 'High', crimes: ['Cybercrime', 'Fraud'], lastSeen: 'Lahore, Pakistan', description: 'Expert hacker with international ties' },
    { _id: '3', name: 'Omar Farooq', alias: 'Iron Fist', age: 45, status: 'Wanted', threatLevel: 'Critical', crimes: ['Drug Trafficking', 'Extortion'], lastSeen: 'Peshawar, Pakistan', description: 'Leader of organized crime ring' },
    { _id: '4', name: 'Zara Khan', alias: 'Phantom', age: 27, status: 'Under Surveillance', threatLevel: 'Medium', crimes: ['Smuggling', 'Bribery'], lastSeen: 'Islamabad, Pakistan', description: 'Suspected smuggling operative' },
    { _id: '5', name: 'Bilal Raza', alias: 'The Broker', age: 52, status: 'Arrested', threatLevel: 'High', crimes: ['Money Laundering', 'Tax Evasion'], lastSeen: 'Rawalpindi, Pakistan', description: 'Financial crime specialist' },
    { _id: '6', name: 'Nadia Syed', alias: 'Shadow', age: 34, status: 'Wanted', threatLevel: 'High', crimes: ['Arms Dealing', 'Conspiracy'], lastSeen: 'Quetta, Pakistan', description: 'Arms trafficker with foreign connections' },
];

const MOCK_CRIMES = [
    { _id: '1', location: 'Karachi Port', type: 'Smuggling', severity: 'High', date: '2024-11-12', lat: 24.8607, lng: 67.0011, status: 'Active' },
    { _id: '2', location: 'Lahore Old City', type: 'Armed Robbery', severity: 'Critical', date: '2024-12-01', lat: 31.5497, lng: 74.3436, status: 'Investigating' },
    { _id: '3', location: 'Islamabad Sector F', type: 'Cybercrime', severity: 'Medium', date: '2024-12-10', lat: 33.7294, lng: 73.0931, status: 'Active' },
    { _id: '4', location: 'Peshawar Bazaar', type: 'Drug Trafficking', severity: 'Critical', date: '2024-12-15', lat: 34.0150, lng: 71.5249, status: 'Active' },
    { _id: '5', location: 'Rawalpindi Cantonment', type: 'Extortion', severity: 'High', date: '2024-12-18', lat: 33.5651, lng: 73.0169, status: 'Resolved' },
    { _id: '6', location: 'Quetta Highway', type: 'Arms Dealing', severity: 'Critical', date: '2024-12-20', lat: 30.1798, lng: 66.9750, status: 'Active' },
];

let useMock = false;
let mockCriminals = [...MOCK_CRIMINALS];

export async function checkBackend() {
    try {
        const res = await fetch('/health');
        const data = await res.json();
        useMock = data.database !== 'CONNECTED';
        return data;
    } catch {
        useMock = true;
        return { status: 'OFFLINE', database: 'DISCONNECTED' };
    }
}

export async function getCriminals(params = {}) {
    if (useMock) {
        let data = [...mockCriminals];
        if (params.search) data = data.filter(c => c.name.toLowerCase().includes(params.search.toLowerCase()) || c.alias.toLowerCase().includes(params.search.toLowerCase()));
        if (params.status) data = data.filter(c => c.status === params.status);
        if (params.threatLevel) data = data.filter(c => c.threatLevel === params.threatLevel);
        return data;
    }
    const res = await API.get('/criminals', { params });
    return res.data.data;
}

export async function createCriminal(data) {
    if (useMock) {
        const newC = {...data, _id: Date.now().toString(), crimes: data.crimes ? data.crimes.split(',').map(c => c.trim()) : [] };
        mockCriminals.unshift(newC);
        return newC;
    }
    const res = await API.post('/criminals', data);
    return res.data.data;
}

export async function updateCriminal(id, data) {
    if (useMock) {
        mockCriminals = mockCriminals.map(c => c._id === id ? {...c, ...data } : c);
        return mockCriminals.find(c => c._id === id);
    }
    const res = await API.put(`/criminals/${id}`, data);
    return res.data.data;
}

export async function deleteCriminal(id) {
    if (useMock) {
        mockCriminals = mockCriminals.filter(c => c._id !== id);
        return true;
    }
    await API.delete(`/criminals/${id}`);
    return true;
}

export async function getCrimes() {
    if (useMock) return MOCK_CRIMES;
    const res = await API.get('/crimes');
    return res.data.data;
}

export async function getStats() {
    if (useMock) {
        return {
            totalCriminals: mockCriminals.length,
            wanted: mockCriminals.filter(c => c.status === 'Wanted').length,
            arrested: mockCriminals.filter(c => c.status === 'Arrested').length,
            critical: mockCriminals.filter(c => c.threatLevel === 'Critical').length,
            totalCrimes: MOCK_CRIMES.length,
            activeCrimes: MOCK_CRIMES.filter(c => c.status === 'Active').length,
        };
    }
    const res = await API.get('/stats');
    return res.data.data;
}