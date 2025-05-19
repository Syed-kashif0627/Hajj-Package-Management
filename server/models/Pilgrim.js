const mongoose = require('mongoose');

// Allow any fields to be saved (no schema restrictions)
const PilgrimSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('Pilgrim', PilgrimSchema);

