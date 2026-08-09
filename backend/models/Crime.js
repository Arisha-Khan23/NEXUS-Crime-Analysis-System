const mongoose = require('mongoose');

const CrimeSchema = new mongoose.Schema({
    location: { type: String, required: true },
    type: { type: String, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    date: { type: Date, default: Date.now },
    lat: { type: Number },
    lng: { type: Number },
    status: { type: String, enum: ['Active', 'Investigating', 'Resolved'], default: 'Active' },
    description: { type: String },
});

module.exports = mongoose.model('Crime', CrimeSchema);