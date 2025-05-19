const mongoose = require('mongoose');

const hotelPilgrimSchema = new mongoose.Schema({
    alRajhiId: String,
    pilgrimCategory: String,
    typeOfPilgrim: String,
    gender: String,
    passportNumber: String,
    fullName: String,
    age: Number,
    email: String,
    mobileNumber: String,
    wheelChair: String,
    guideName: String,
    packageName: String,
    hotel1: {
        name: String,
        rating: String,
        services: String,
        roomType: String,
        checkIn: Date,
        checkOut: Date
    },
    hotel2: {
        name: String,
        rating: String,
        services: String,
        roomType: String,
        checkIn: Date,
        checkOut: Date
    }
}, { 
    timestamps: true,
    strict: false // This allows for flexible schema
});

module.exports = mongoose.model('HotelPilgrim', hotelPilgrimSchema);