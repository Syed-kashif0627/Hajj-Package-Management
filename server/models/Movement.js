const mongoose = require('mongoose');

const pilgrimDetailSchema = new mongoose.Schema({
    id: String,
    name: String,
    gender: String,
    passportNumber: String,
    packageName: String
});

const movementSchema = new mongoose.Schema({
    id: String,
    type: String,
    from: String,
    to: String,
    date: String,
    time: String,
    flightNumber: String,
    transportation: String,
    status: String,
    pilgrimCount: Number,
    pilgrimDetails: [pilgrimDetailSchema]
});

module.exports = mongoose.model('Movement', movementSchema);