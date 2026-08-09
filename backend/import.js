require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Crime = require('./models/Crime');

const MAX_ROWS = 300;

// Map Chicago "Primary Type" values to your severity levels
function getSeverity(primaryType) {
    const type = (primaryType || '').toUpperCase();

    const critical = ['HOMICIDE', 'CRIM SEXUAL ASSAULT', 'CRIMINAL SEXUAL ASSAULT', 'KIDNAPPING'];
    const high = ['ROBBERY', 'ASSAULT', 'BATTERY', 'ARSON', 'WEAPONS VIOLATION'];
    const medium = ['BURGLARY', 'THEFT', 'MOTOR VEHICLE THEFT', 'NARCOTICS'];

    if (critical.includes(type)) return 'Critical';
    if (high.includes(type)) return 'High';
    if (medium.includes(type)) return 'Medium';
    return 'Low';
}

function getStatus(arrestValue) {
    // Handles "true"/"false" (Chicago) as well as "True"/"False" (Python/pandas export)
    return String(arrestValue).toLowerCase() === 'true' ? 'Resolved' : 'Active';
}

function parseChicagoDate(dateStr) {
    // Example format: "01/12/2024 11:30:00 PM"
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function getLocation(row) {
    // Prefer Area + City (Pakistan dataset), fall back to Location Description,
    // then Block (original Chicago dataset), then Unknown as a last resort.
    if (row['Area'] && row['City']) {
        return `${row['Area']}, ${row['City']}`;
    }
    if (row['Location Description']) {
        return row['Location Description'];
    }
    if (row['Block']) {
        return row['Block'];
    }
    return 'Unknown';
}

async function importCrimes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('[IMPORT] MongoDB connected');

        const deleted = await Crime.deleteMany({});
        console.log(`[IMPORT] Cleared ${deleted.deletedCount} existing crime records`);

        const csvPath = path.join(__dirname, 'data', 'crimes.csv');
        const collected = [];

        const stream = fs.createReadStream(csvPath).pipe(csv());

        for await (const row of stream) {
            if (collected.length >= MAX_ROWS) break;

            const lat = parseFloat(row['Latitude']);
            const lng = parseFloat(row['Longitude']);

            // Skip rows with missing/invalid coordinates - they'd break the map
            if (isNaN(lat) || isNaN(lng)) continue;

            collected.push({
                location: getLocation(row),
                type: row['Primary Type'] || 'Unknown',
                severity: getSeverity(row['Primary Type']),
                date: parseChicagoDate(row['Date']),
                lat,
                lng,
                status: getStatus(row['Arrest']),
                description: row['Description'] || '',
            });
        }

        stream.destroy(); // stop reading the rest of the rows once we have enough

        if (collected.length === 0) {
            console.log('[IMPORT] No valid rows found - check your CSV column names and file path');
        } else {
            await Crime.insertMany(collected);
            console.log(`[IMPORT] Inserted ${collected.length} crime records successfully`);
        }
    } catch (err) {
        console.error('[IMPORT] Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('[IMPORT] Done, disconnected from MongoDB');
    }
}

importCrimes();