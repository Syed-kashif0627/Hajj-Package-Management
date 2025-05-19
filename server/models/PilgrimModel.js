const mongoose = require('mongoose');

const PilgrimSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    passportNumber: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    country: {
        type: String,
        default: 'USA',
        trim: true
    },
    guide: {
        type: String,
        trim: true
    },
    organizer: {
        type: String,
        default: 'Noor Al-Fajr',
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Pending'],
        default: 'Active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pilgrim', PilgrimSchema);