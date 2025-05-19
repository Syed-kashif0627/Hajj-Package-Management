const express = require('express');
const router = express.Router();
const LinkedPilgrim = require('../models/LinkedPilgrim');

// Get all linked pilgrims
router.get('/linked', async (req, res) => {
    try {
        const pilgrims = await LinkedPilgrim.find();
        res.json(pilgrims);
    } catch (error) {
        console.error('Error fetching pilgrims:', error);
        res.status(500).json({ message: 'Failed to fetch pilgrims' });
    }
});

// Bulk link pilgrims
router.post('/bulk-link', async (req, res) => {
    try {
        const { pilgrims } = req.body;
        
        if (!Array.isArray(pilgrims) || pilgrims.length === 0) {
            return res.status(400).json({ message: 'Invalid pilgrims data' });
        }

        console.log('Received pilgrims:', pilgrims); // Debug log

        // Insert many pilgrims at once
        const result = await LinkedPilgrim.insertMany(pilgrims, { ordered: false });
        console.log('Inserted pilgrims:', result); // Debug log

        // Fetch and return the updated list
        const updatedPilgrims = await LinkedPilgrim.find();
        res.status(201).json(updatedPilgrims);
    } catch (error) {
        console.error('Error bulk linking pilgrims:', error);
        res.status(400).json({ 
            message: error.code === 11000 ? 
                'Some pilgrims already exist' : 
                'Failed to link pilgrims' 
        });
    }
});

module.exports = router;