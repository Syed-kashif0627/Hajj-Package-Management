const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const GuideSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: false
    },
    passportId: {
        type: String,
        default: 'No Passport Photo'
    },
    nusukEmail: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    mobile: {
        type: String,
        default: ''
    },
    passportFile: {
        type: String,
        default: ''
    },
    profileStatus: {
        type: String,
        enum: ['complete', 'incomplete'],
        default: 'incomplete'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
GuideSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Guide', GuideSchema);