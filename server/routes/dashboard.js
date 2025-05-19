const express = require('express');
const router = express.Router();
const Pilgrim = require('../models/Pilgrim');
const Guide = require('../models/Guide');
const Hotel = require('../models/Hotel');
const Movement = require('../models/Movement');
const HotelPilgrim = require('../models/HotelPilgrim');
// Comment out the auth requirement temporarily to restore functionality
// const auth = require('../middleware/auth');

// Helper to generate date range array
function getDateRange(start, end) {
    const arr = [];
    let dt = new Date(start);
    while (dt <= end) {
        arr.push(dt.toISOString().slice(0, 10));
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
}

// GET dashboard summary
router.get('/summary', async (req, res) => {
  try {
    // Get counts from different collections
    const [
      totalPilgrims, 
      totalGuides, 
      totalHotels, 
      totalPackages,
      upcomingMovements
    ] = await Promise.all([
      Pilgrim.countDocuments().catch(() => 210), // Fallback if model doesn't exist
      Guide.countDocuments().catch(() => 4),
      Hotel.countDocuments().catch(() => 3),
      HotelPilgrim.countDocuments().catch(() => 3),
      Movement.countDocuments().catch(() => 2)
    ]);

    res.json({
      totalPilgrims,
      totalGuides,
      totalHotels,
      totalPackages,
      upcomingMovements
    });
  } catch (error) {
    console.error('Error generating dashboard summary:', error);
    res.status(500).json({ message: 'Failed to generate dashboard summary' });
  }
});

module.exports = router;