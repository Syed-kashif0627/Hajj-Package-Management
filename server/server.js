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
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
// Enhanced MongoDB connection with error handling
mongoose.connect(process.env.MONGO_URI, {
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

const allowedOrigins = [
  'https://gregarious-chaja-42a3c3.netlify.app', // Replace with your Netlify URL
  'http://localhost:3000' // For local development
];
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // If you need to send cookies
};
// Enable CORS  
app.use(cors(corsOptions));


// Middleware
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true
// }));
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