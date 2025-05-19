const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const guideRoutes = require('./routes/guideRoutes');
const pilgrimRoutes = require('./routes/pilgrimRoutes');
const movementRoutes = require('./routes/movementRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const hotelPilgrimRoutes = require('./routes/hotelPilgrimRoutes');
const linkedPilgrimRoutes = require('./routes/linkedPilgrimRoutes');
const dashboardRoutes = require('./routes/dashboard');
const passportVisaRoutes = require('./routes/passportVisaRoutes');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS  
app.use(cors());

// Enhanced MongoDB connection with error handling
mongoose.connect('mongodb://localhost:27017/Hajj_package_DB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Check if your MongoDB server is running and the connection string is correct');
});

// Add an event listener for connection errors
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/pilgrims', pilgrimRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/hotel-pilgrims', hotelPilgrimRoutes);
app.use('/api/linked-pilgrims', linkedPilgrimRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/passport-visa', passportVisaRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('API is running');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});