const express = require('express');
const router = express.Router();
const Pilgrim = require('../models/Pilgrim');

// Get all pilgrims
router.get('/', async (req, res) => {
    try {
        const pilgrims = await Pilgrim.find();
        res.json(pilgrims);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create multiple pilgrims (bulk import)
router.post('/bulk', async (req, res) => {
    try {
        const pilgrims = await Pilgrim.insertMany(req.body);
        res.status(201).json(pilgrims);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Import pilgrims with transformation
router.post('/import', async (req, res) => {
    try {
        const pilgrims = req.body.pilgrims;
        if (!Array.isArray(pilgrims)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        await Pilgrim.deleteMany({});
        const inserted = await Pilgrim.insertMany(pilgrims);

        res.json(inserted);
    } catch (error) {
        // Log the actual error for debugging
        console.error('Import error:', error);
        // Also log the first pilgrim for debugging
        if (req.body.pilgrims && req.body.pilgrims.length > 0) {
            console.error('First pilgrim:', req.body.pilgrims[0]);
        }
        // Return the full error stack for debugging
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// Bulk link pilgrims with guide assignment
router.post('/bulk-link', async (req, res) => {
    try {
        const { pilgrims } = req.body;
        
        // Process each pilgrim
        const results = await Promise.all(pilgrims.map(async pilgrim => {
            // Update or create pilgrim with guide assignment
            return await Pilgrim.findOneAndUpdate(
                { passportNumber: pilgrim['Passport No'] },
                { 
                    name: pilgrim['Name'],
                    guideName: pilgrim['Guide Name'],
                    // Add other fields as needed
                },
                { upsert: true, new: true }
            );
        }));

        res.json({ success: true, count: results.length });
    } catch (error) {
        console.error('Error in bulk link:', error);
        res.status(500).json({ error: 'Failed to process bulk link request' });
    }
});

// Get a single pilgrim
router.get('/:id', async (req, res) => {
    try {
        const pilgrim = await Pilgrim.findById(req.params.id);
        if (pilgrim) {
            res.json(pilgrim);
        } else {
            res.status(404).json({ message: 'Pilgrim not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a pilgrim
router.delete('/:id', async (req, res) => {
    try {
        const pilgrim = await Pilgrim.findById(req.params.id);
        if (!pilgrim) {
            return res.status(404).json({ message: 'Pilgrim not found' });
        }
        await Pilgrim.findByIdAndDelete(req.params.id);
        res.json({ message: 'Pilgrim deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
