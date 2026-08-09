const mongoose = require('mongoose');

const CriminalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    alias: { type: String },
    age: { type: Number },
    status: { type: String, enum: ['Wanted', 'Arrested', 'Under Surveillance'], default: 'Wanted' },
    threatLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    crimes: [{ type: String }],
    lastSeen: { type: String },
    description: { type: String },
    img: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Criminal', CriminalSchema);