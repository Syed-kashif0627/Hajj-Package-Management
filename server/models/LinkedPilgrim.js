const mongoose = require('mongoose');

const linkedPilgrimSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    passport: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    guide: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Approved', 'Pending', 'Rejected'],
        default: 'Pending'
    },
    nationality: {
        type: String,
        default: 'Not specified'
    }
}, { 
    timestamps: true,
    collection: 'linkedpilgrims' 
});

module.exports = mongoose.model('LinkedPilgrim', linkedPilgrimSchema);