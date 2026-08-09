const express = require('express');
const router = express.Router();
const Criminal = require('../models/Criminal');
const Crime = require('../models/Crime');

// ─── CRIMINALS ───────────────────────────────────────────────
router.get('/criminals', async(req, res) => {
    try {
        const { search, status, threatLevel } = req.query;
        let query = {};
        if (search) query.$or = [{ name: new RegExp(search, 'i') }, { alias: new RegExp(search, 'i') }];
        if (status) query.status = status;
        if (threatLevel) query.threatLevel = threatLevel;
        const criminals = await Criminal.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: criminals });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/criminals/:id', async(req, res) => {
    try {
        const criminal = await Criminal.findById(req.params.id);
        if (!criminal) return res.status(404).json({ success: false, error: 'Not found' });
        res.json({ success: true, data: criminal });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/criminals', async(req, res) => {
    try {
        const criminal = await Criminal.create(req.body);
        res.status(201).json({ success: true, data: criminal });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.put('/criminals/:id', async(req, res) => {
    try {
        const criminal = await Criminal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!criminal) return res.status(404).json({ success: false, error: 'Not found' });
        res.json({ success: true, data: criminal });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.delete('/criminals/:id', async(req, res) => {
    try {
        const criminal = await Criminal.findByIdAndDelete(req.params.id);
        if (!criminal) return res.status(404).json({ success: false, error: 'Not found' });
        res.json({ success: true, message: 'Record deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── CRIMES ──────────────────────────────────────────────────
router.get('/crimes', async(req, res) => {
    try {
        const crimes = await Crime.find().sort({ date: -1 });
        res.json({ success: true, data: crimes });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/crimes', async(req, res) => {
    try {
        const crime = await Crime.create(req.body);
        res.status(201).json({ success: true, data: crime });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.put('/crimes/:id', async(req, res) => {
    try {
        const crime = await Crime.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: crime });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.delete('/crimes/:id', async(req, res) => {
    try {
        await Crime.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Crime record deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── STATS ───────────────────────────────────────────────────
router.get('/stats', async(req, res) => {
    try {
        const totalCriminals = await Criminal.countDocuments();
        const wanted = await Criminal.countDocuments({ status: 'Wanted' });
        const arrested = await Criminal.countDocuments({ status: 'Arrested' });
        const critical = await Criminal.countDocuments({ threatLevel: 'Critical' });
        const totalCrimes = await Crime.countDocuments();
        const activeCrimes = await Crime.countDocuments({ status: 'Active' });
        res.json({ success: true, data: { totalCriminals, wanted, arrested, critical, totalCrimes, activeCrimes } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;