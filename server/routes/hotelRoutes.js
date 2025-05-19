const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');

// Get all hotels
router.get('/', async (req, res) => {
    try {
        const hotels = await Hotel.find();
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new hotel
router.post('/', async (req, res) => {
    const hotel = new Hotel(req.body);
    try {
        const newHotel = await hotel.save();
        res.status(201).json(newHotel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;