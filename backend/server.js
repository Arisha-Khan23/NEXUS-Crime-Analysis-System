const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(async() => {
        console.log('[SYSTEM] MongoDB connected successfully');
        await seedDatabase();
    })
    .catch(err => {
        console.log('[SYSTEM] MongoDB connection failed — running with mock data');
        console.log('[SYSTEM] Error:', err.message);
    });

// Seed function
async function seedDatabase() {
    const Criminal = require('./models/Criminal');
    const Crime = require('./models/Crime');

    const criminalCount = await Criminal.countDocuments();
    if (criminalCount === 0) {
        console.log('[SYSTEM] Seeding criminal database...');
        await Criminal.insertMany([
            { name: 'Marcus Vega', alias: 'The Ghost', age: 38, status: 'Wanted', threatLevel: 'Critical', crimes: ['Armed Robbery', 'Murder'], lastSeen: 'Karachi, Pakistan', description: 'Highly dangerous — armed and unpredictable', img: '' },
            { name: 'Layla Hassan', alias: 'Serpent', age: 31, status: 'Arrested', threatLevel: 'High', crimes: ['Cybercrime', 'Fraud'], lastSeen: 'Lahore, Pakistan', description: 'Expert hacker with international ties', img: '' },
            { name: 'Omar Farooq', alias: 'Iron Fist', age: 45, status: 'Wanted', threatLevel: 'Critical', crimes: ['Drug Trafficking', 'Extortion'], lastSeen: 'Peshawar, Pakistan', description: 'Leader of organized crime ring', img: '' },
            { name: 'Zara Khan', alias: 'Phantom', age: 27, status: 'Under Surveillance', threatLevel: 'Medium', crimes: ['Smuggling', 'Bribery'], lastSeen: 'Islamabad, Pakistan', description: 'Suspected smuggling operative', img: '' },
            { name: 'Bilal Raza', alias: 'The Broker', age: 52, status: 'Arrested', threatLevel: 'High', crimes: ['Money Laundering', 'Tax Evasion'], lastSeen: 'Rawalpindi, Pakistan', description: 'Financial crime specialist', img: '' },
            { name: 'Nadia Syed', alias: 'Shadow', age: 34, status: 'Wanted', threatLevel: 'High', crimes: ['Arms Dealing', 'Conspiracy'], lastSeen: 'Quetta, Pakistan', description: 'Arms trafficker with foreign connections', img: '' },
        ]);
        console.log('[SYSTEM] Criminal database seeded.');
    }

    const crimeCount = await Crime.countDocuments();
    if (crimeCount === 0) {
        await Crime.insertMany([
            { location: 'Karachi Port', type: 'Smuggling', severity: 'High', date: new Date('2024-11-12'), lat: 24.8607, lng: 67.0011, status: 'Active' },
            { location: 'Lahore Old City', type: 'Armed Robbery', severity: 'Critical', date: new Date('2024-12-01'), lat: 31.5497, lng: 74.3436, status: 'Investigating' },
            { location: 'Islamabad Sector F', type: 'Cybercrime', severity: 'Medium', date: new Date('2024-12-10'), lat: 33.7294, lng: 73.0931, status: 'Active' },
            { location: 'Peshawar Bazaar', type: 'Drug Trafficking', severity: 'Critical', date: new Date('2024-12-15'), lat: 34.0150, lng: 71.5249, status: 'Active' },
            { location: 'Rawalpindi Cantonment', type: 'Extortion', severity: 'High', date: new Date('2024-12-18'), lat: 33.5651, lng: 73.0169, status: 'Resolved' },
            { location: 'Quetta Highway', type: 'Arms Dealing', severity: 'Critical', date: new Date('2024-12-20'), lat: 30.1798, lng: 66.9750, status: 'Active' },
        ]);
        console.log('[SYSTEM] Crime hotspots seeded.');
    }
}

// Routes
app.use('/api', require('./routes/api'));

// Health check
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
    res.json({ status: 'ONLINE', database: dbStatus, version: '2.4.1-CLASSIFIED' });
});

app.listen(PORT, () => {
    console.log(`[SYSTEM] Crime Analysis Server running on port ${PORT}`);
});