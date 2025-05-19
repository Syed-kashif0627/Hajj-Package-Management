const express = require('express');
const router = express.Router();
const Movement = require('../models/Movement');

// Get all movements
router.get('/', async (req, res) => {
    try {
        const movements = await Movement.find();
        res.json(movements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new movements
router.post('/batch', async (req, res) => {
    try {
        const movements = req.body;
        const savedMovements = await Movement.insertMany(movements);
        res.status(201).json(savedMovements);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;