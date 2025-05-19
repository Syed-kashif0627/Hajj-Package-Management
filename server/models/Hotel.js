const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, default: 'Single Building' },
    location: String,
    totalRooms: Number,
    capacity: Number,
    status: { type: String, default: 'Available' }
});

module.exports = mongoose.model('Hotel', hotelSchema);