const express = require('express');
const router = express.Router();
const HotelPilgrim = require('../models/HotelPilgrim');

router.post('/import', async (req, res) => {
    try {
        const pilgrims = req.body;
        
        // Input validation
        if (!Array.isArray(pilgrims)) {
            return res.status(400).json({ 
                error: 'Invalid input: Expected an array' 
            });
        }

        // Transform and validate each record
        const transformedPilgrims = pilgrims.map(p => ({
            alRajhiId: String(p['Al Rajhi ID'] || ''),
            pilgrimCategory: String(p['Pilgrim Category'] || ''),
            typeOfPilgrim: String(p['Type of Pilgrim'] || ''),
            gender: String(p['Gender'] || ''),
            passportNumber: String(p['Passport Number'] || ''),
            fullName: String(p['Full Name'] || ''),
            age: p['Age'] ? parseInt(p['Age']) : null,
            email: String(p['Email'] || ''),
            mobileNumber: String(p['Mobile Number'] || ''),
            wheelChair: String(p['Wheel Chair'] || ''),
            guideName: String(p['Guide Name'] || ''),
            packageName: String(p['Package Name'] || ''),
            hotel1: {
                name: String(p['Hotel 1'] || ''),
                rating: String(p['Hotel 1 Rating'] || ''),
                services: String(p['Hotel 1 Services'] || ''),
                roomType: String(p['Room Type 1'] || ''),
                checkIn: p['Hotel 1 Check In'] || null,
                checkOut: p['Hotel 1 Check Out'] || null
            },
            hotel2: {
                name: String(p['Hotel 2'] || ''),
                rating: String(p['Hotel 2 Rating'] || ''),
                services: String(p['Hotel 2 Services'] || ''),
                roomType: String(p['Room Type 2'] || ''),
                checkIn: p['Hotel 2 Check In'] || null,
                checkOut: p['Hotel 2 Check Out'] || null
            }
        }));

        // Clear existing data and insert new records
        await HotelPilgrim.deleteMany({});
        const result = await HotelPilgrim.insertMany(transformedPilgrims);

        res.status(200).json({
            success: true,
            count: result.length,
            message: 'Data imported successfully'
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            error: 'Failed to import data: ' + error.message
        });
    }
});

// Get pilgrims by hotel name with pagination
router.get('/hotel/:hotelName', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const hotelName = req.params.hotelName;
        
        const pilgrims = await HotelPilgrim.find({
            $or: [
                { 'hotel1.name': new RegExp(hotelName, 'i') },
                { 'hotel2.name': new RegExp(hotelName, 'i') }
            ]
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

        const count = await HotelPilgrim.countDocuments({
            $or: [
                { 'hotel1.name': new RegExp(hotelName, 'i') },
                { 'hotel2.name': new RegExp(hotelName, 'i') }
            ]
        });

        res.json({
            pilgrims,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalItems: count
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pilgrims' });
    }
});

// Add this new route to get all pilgrims
router.get('/all', async (req, res) => {
    try {
        const pilgrims = await HotelPilgrim.find({})
            .select('hotel1 hotel2')
            .lean();
        
        res.json({
            success: true,
            pilgrims: pilgrims
        });
    } catch (error) {
        console.error('Error fetching all pilgrims:', error);
        res.status(500).json({ 
            error: 'Failed to fetch pilgrims data' 
        });
    }
});

// Add this new route for getting statistics
router.get('/statistics', async (req, res) => {
    try {
        // Get all hotels
        const pilgrims = await HotelPilgrim.find({}).lean();
        
        // Get unique hotels
        const uniqueHotels = new Set();
        pilgrims.forEach(p => {
            if (p.hotel1?.name) uniqueHotels.add(p.hotel1.name);
            if (p.hotel2?.name) uniqueHotels.add(p.hotel2.name);
        });

        // Calculate hotel-wise occupancy
        const hotelStats = Array.from(uniqueHotels).map(hotelName => {
            const occupancy = pilgrims.reduce((count, p) => {
                if (p.hotel1?.name === hotelName) count++;
                if (p.hotel2?.name === hotelName) count++;
                return count;
            }, 0);

            return {
                name: hotelName,
                occupancy: Math.round((occupancy / 300) * 100) // Assuming 300 capacity per hotel
            };
        });

        // Calculate overall statistics
        const totalHotels = uniqueHotels.size;
        const totalRooms = totalHotels * 100; // Assuming 100 rooms per hotel
        const totalCapacity = totalHotels * 300; // Assuming 300 capacity per hotel
        
        const totalOccupied = pilgrims.reduce((count, p) => {
            if (p.hotel1?.name) count++;
            if (p.hotel2?.name) count++;
            return count;
        }, 0);

        const occupancyRate = Math.round((totalOccupied / totalCapacity) * 100);

        res.json({
            success: true,
            stats: {
                totalHotels,
                totalRooms,
                totalCapacity,
                occupancyRate
            },
            hotelOccupancy: hotelStats
        });
    } catch (error) {
        console.error('Error calculating statistics:', error);
        res.status(500).json({ 
            error: 'Failed to calculate statistics' 
        });
    }
});

module.exports = router;