const mongoose = require('mongoose');

const passportVisaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    passportNumber: {
        type: String,
        required: true,
        trim: true
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
    documentType: {
        type: String,
        enum: ['Passport', 'Visa'],
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    uploadedBy: {
        type: String,
        default: 'System'
    },
    status: {
        type: String,
        enum: ['Complete', 'Missing', 'Pending'],
        default: 'Pending'
    },
    documentName: {
        type: String,
        default: 'Younis Lala'
    },
    // Add fileDetails field
    fileDetails: {
        filename: String,
        originalname: String,
        mimetype: String,
        size: Number,
        path: String,
        uploadDate: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('PassportVisa', passportVisaSchema);