const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }
        
        // // Check if email domain exists
        // const domain = email.split('@')[1];
        // try {
        //     const { promises: dns } = require('dns');
        //     const mxRecords = await dns.resolveMx(domain).catch(() => []);
        //     if (mxRecords.length === 0) {
        //         return res.status(400).json({ message: 'Please enter a valid email with an existing domain' });
        //     }
        // } catch (dnsError) {
        //     console.error('DNS check error:', dnsError);
        //     // Continue with registration if DNS check fails (optional)
        // }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Password strength validation
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).json({ 
                message: 'Password must include at least one uppercase letter, one lowercase letter, and one number' 
            });
        }
        
        // Create new user
        const user = new User({
            email,
            password, // Password will be hashed by pre-save hook in User model
        });
        
        await user.save();
        
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Create and sign JWT token
        const payload = {
            id: user._id,
            email: user.email,
            createdBy: user._id // Add this to track who created guides
        };
        
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'jwtSecretKey',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user._id,
                        email: user.email
                    }
                });
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user profile (only email)
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Only send back the email and lastLogin
        res.json({
            email: user.email,
            lastLogin: user.lastLogin || new Date()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change password route
router.post('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both current and new passwords are required' });
        }
        
        // Get user from database
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        // Password strength validation
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        
        if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            return res.status(400).json({ 
                message: 'Password must include at least one uppercase letter, one lowercase letter, and one number' 
            });
        }
        
        // Update password
        user.password = newPassword;
        // The password will be automatically hashed by the pre-save hook in the User model
        
        // Update lastLogin
        user.lastLogin = new Date();
        
        // Save user with new password
        await user.save();
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;