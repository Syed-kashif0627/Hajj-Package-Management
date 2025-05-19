const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const Guide = require('../models/Guide');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/passports');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Use passport number (if available) or timestamp for filename
        const passportNumber = req.body.passportNumber || Date.now().toString();
        const fileExt = path.extname(file.originalname);
        cb(null, `${passportNumber}${fileExt}`);
    }
});

// File filter for passport documents
const fileFilter = (req, file, cb) => {
    // Accept only jpeg, jpg, png, and pdf files
    if (file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png' || 
        file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// PUT update guide
router.put('/:id',auth, upload.single('passportFile'), async (req, res) => {
    try {
        console.log('Updating guide:', req.params.id);
        console.log('Request body:', req.body);
        console.log('File:', req.file);
        
        const { name, passportNumber, nusukEmail, mainPhone, hajjPhone } = req.body;
        
        // Find guide by ID
        const guide = await Guide.findById(req.params.id);
        if (!guide) {
            return res.status(404).json({ message: 'Guide not found' });
        }
        
        console.log('Found guide:', guide);
        console.log('User organizationId:', req.user.organizationId);
        console.log('Guide organizationId:', guide.organizationId);
        
        // Check if user has permission (created by this user)
        if (guide.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this guide' });
        }
        
        // Update fields
        guide.name = name;
        guide.passportId = passportNumber || 'No Passport Photo';
        guide.nusukEmail = nusukEmail || '';
        guide.phone = mainPhone || '';
        guide.mobile = hajjPhone || '';
        
        // Update passport file if provided
        if (req.file) {
            // Delete old file if exists
            if (guide.passportFile) {
                const oldFilePath = path.join(__dirname, '../uploads/passports', guide.passportFile);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            
            // Save new file
            guide.passportFile = req.file.filename;
        }
        
        // Update profile completion status based on passport file
        guide.profileStatus = guide.passportFile ? 'complete' : 'incomplete';
        
        // Save the updated guide
        const updatedGuide = await guide.save();
        console.log('Guide updated successfully:', updatedGuide);
        
        // Return guide without password
        const guideResponse = updatedGuide.toObject();
        delete guideResponse.password;
        
        res.json(guideResponse);
    } catch (error) {
        console.error('Error updating guide:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// GET recent guides
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const guides = await Guide.find()
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);
      
    res.json(guides);
  } catch (error) {
    console.error('Error fetching recent guides:', error);
    res.status(500).json({ message: 'Failed to fetch recent guides' });
  }
});

// GET all guides for the current user
router.get('/', async (req, res) => {
    try {
        const guides = await Guide.find();
        res.json({ guides }); // Make sure we're sending an object with a guides array
    } catch (error) {
        console.error('Error fetching guides:', error);
        res.status(500).json({ error: 'Failed to fetch guides' });
    }
});

// POST create new guide
router.post('/', auth, upload.single('passportFile'), async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password, 
            passportNumber, 
            nusukEmail, 
            mainPhone, 
            hajjPhone 
        } = req.body;
        
        // Check if guide with this email already exists
        const existingGuide = await Guide.findOne({ email });
        if (existingGuide) {
            return res.status(400).json({ message: 'Guide with this email already exists' });
        }
        
        // Create new guide object
        const newGuide = new Guide({
            name,
            email,
            password, // Will be hashed in the pre-save hook
            organizationId: req.user.organizationId,  // Keep this for future use
            passportId: passportNumber || 'No Passport Photo',
            nusukEmail: nusukEmail || '',
            phone: mainPhone || '',
            mobile: hajjPhone || '',
            passportFile: req.file ? req.file.filename : '',
            profileStatus: req.file ? 'complete' : 'incomplete',
            createdBy: req.user.id  // This is the important part for user separation
        });
        
        // Save guide to database
        await newGuide.save();
        
        // Return guide without password
        const guideResponse = newGuide.toObject();
        delete guideResponse.password;
        
        res.status(201).json(guideResponse);
    } catch (error) {
        console.error('Error creating guide:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// DELETE guide by ID
router.delete('/:id', auth, async (req, res) => {
    try {
        const guide = await Guide.findById(req.params.id);
        
        // Check if guide exists
        if (!guide) {
            return res.status(404).json({ message: 'Guide not found' });
        }
        
        // Check if user has permission (created by this user)
        if (guide.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this guide' });
        }
        
        // Delete passport file if exists
        if (guide.passportFile) {
            const filePath = path.join(__dirname, '../uploads/passports', guide.passportFile);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        // Delete guide from database - updated to use findByIdAndDelete instead of remove()
        await Guide.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Guide deleted successfully' });
    } catch (error) {
        console.error('Error deleting guide:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE passport file for a guide
router.delete('/:id/passport', async (req, res) => {
    try {
        const guide = await Guide.findById(req.params.id);
        
        // Check if guide exists
        if (!guide) {
            return res.status(404).json({ message: 'Guide not found' });
        }
        
        // Check if user has permission (created by this user)
        if (guide.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to modify this guide' });
        }
        
        // Check if guide has a passport file
        if (!guide.passportFile) {
            return res.status(400).json({ message: 'No passport file to delete' });
        }
        
        // Delete the file from filesystem
        const filePath = path.join(__dirname, '../uploads/passports', guide.passportFile);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // Update guide record
        guide.passportFile = '';
        guide.profileStatus = 'incomplete';
        await guide.save();
        
        res.json({ message: 'Passport file deleted successfully' });
    } catch (error) {
        console.error('Error deleting passport file:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET passport file with content type handling
router.get('/passport/:filename', (req, res) => {
    try {
        const filePath = path.join(__dirname, '../uploads/passports', req.params.filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }
        
        // Set appropriate content type based on file extension
        const ext = path.extname(req.params.filename).toLowerCase();
        if (ext === '.pdf') {
            res.setHeader('Content-Type', 'application/pdf');
        } else if (ext === '.jpg' || ext === '.jpeg') {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (ext === '.png') {
            res.setHeader('Content-Type', 'image/png');
        }
        
        // Set content disposition to inline for viewing in browser
        res.setHeader('Content-Disposition', `inline; filename="${req.params.filename}"`);
        
        // Send the file
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving file:', error);
        res.status(500).json({ message: 'Error serving file' });
    }
});


// GET view passport file (no auth middleware for direct access)
router.get('/view-passport/:filename', (req, res) => {
    try {
        // If you want token verification, you can use this
        // const token = req.query.token;
        // if (token) {
        //     jwt.verify(token, process.env.JWT_SECRET || 'jwtSecretKey');
        // }
        
        // For now, let's skip token verification for document viewing
        
        const filePath = path.join(__dirname, '../uploads/passports', req.params.filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).send('File not found');
        }
        
        // Set appropriate content type based on file extension
        const ext = path.extname(req.params.filename).toLowerCase();
        if (ext === '.pdf') {
            res.setHeader('Content-Type', 'application/pdf');
        } else if (ext === '.jpg' || ext === '.jpeg') {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (ext === '.png') {
            res.setHeader('Content-Type', 'image/png');
        }
        
        // Set content disposition to inline for viewing in browser
        res.setHeader('Content-Disposition', `inline; filename="${req.params.filename}"`);
        
        // Send the file
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error viewing file:', error);
        res.status(500).send('Error viewing file');
    }
});



module.exports = router;