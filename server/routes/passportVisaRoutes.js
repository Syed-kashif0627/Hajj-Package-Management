const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs'); // Add this import
const multer = require('multer');
const archiver = require('archiver');

// Import models with safe access
let PassportVisa;
let Pilgrim;

// Check if models exist in mongoose registry first
try {
    // Check if model is already registered with mongoose
    if (mongoose.models.PassportVisa) {
        PassportVisa = mongoose.models.PassportVisa;
    } else {
        // If not registered, try to require it
        PassportVisa = require('../models/PassportVisaModel');
    }
} catch (err) {
    console.warn("PassportVisaModel not found, creating it dynamically");
    
    // Create the model dynamically if it doesn't exist
    const PassportVisaSchema = new mongoose.Schema({
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
            default: 'Younis List'
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
    
    PassportVisa = mongoose.model('PassportVisa', PassportVisaSchema);
}

// For the Pilgrim model, check if it's already registered
if (mongoose.models.Pilgrim) {
    Pilgrim = mongoose.models.Pilgrim;
} else {
    try {
        Pilgrim = require('../models/PilgrimModel');
    } catch (err) {
        console.warn("PilgrimModel not found");
        Pilgrim = null;
    }
}

// Define storage structure for uploaded documents - simplified for temporary storage
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store all uploads in a temporary folder first
    const uploadDir = path.join(__dirname, '../uploads/temp');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use a timestamp for temporary files
    const timestamp = Date.now();
    const fileExt = path.extname(file.originalname) || '.pdf';
    const filename = `temp_${timestamp}${fileExt}`;
    cb(null, filename);
  }
});

// Filter allowed file types
const documentFilter = (req, file, cb) => {
  // Accept only PDF and JPEG files
  const allowedMimes = [
    'application/pdf',
    'image/jpeg'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and JPEG files are allowed.'), false);
  }
};

// Setup upload middleware with the configured storage
const documentUpload = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        
        // Create the directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Define file filter to only accept Excel files
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'application/vnd.ms-excel' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only Excel files are allowed!'), false);
    }
};


// Define storage for Excel file uploads
const excelStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create excel uploads folder if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads/excel');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const fileExt = path.extname(file.originalname);
    const uniqueName = `import_${Date.now()}${fileExt}`;
    cb(null, uniqueName);
  }
});

// Filter to only allow Excel files
const excelFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel files (.xlsx, .xls) are allowed.'), false);
  }
};

// Setup multer for excel file uploads
const upload = multer({
  storage: excelStorage,
  fileFilter: excelFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
// Simple direct route for testing - place at the top of your routes
router.get('/direct-pdf/:passportNumber', async (req, res) => {
  try {
    // Log passport number for debugging
    console.log('Requested passport number:', req.params.passportNumber);
    
    // Find document in database
    const document = await PassportVisa.findOne({ 
      passportNumber: req.params.passportNumber 
    });
    
    if (!document) {
      console.log('No document found in database for passport:', req.params.passportNumber);
      return res.status(404).send('Document not found in database');
    }
    
    console.log('Found document in database:', document._id);
    
    // Check ALL possible file locations - including BOTH passport AND visa folders
    const possiblePaths = [
      // Check in BOTH folders regardless of document type
      path.join(__dirname, '../uploads/documents/passport', `${req.params.passportNumber}.pdf`),
      path.join(__dirname, '../uploads/documents/visa', `${req.params.passportNumber}.pdf`),
      
      // Try without subfolders
      path.join(__dirname, '../uploads/documents', `${req.params.passportNumber}.pdf`),
      
      // Try with possible prefixes in passport folder
      path.join(__dirname, '../uploads/documents/passport', `passport_${req.params.passportNumber}.pdf`),
      path.join(__dirname, '../uploads/documents/passport', `visa_${req.params.passportNumber}.pdf`),
      
      // Try with possible prefixes in visa folder
      path.join(__dirname, '../uploads/documents/visa', `passport_${req.params.passportNumber}.pdf`),
      path.join(__dirname, '../uploads/documents/visa', `visa_${req.params.passportNumber}.pdf`),
      
      // Try with other extensions in both folders
      path.join(__dirname, '../uploads/documents/passport', `${req.params.passportNumber}.jpg`),
      path.join(__dirname, '../uploads/documents/passport', `${req.params.passportNumber}.jpeg`),
      path.join(__dirname, '../uploads/documents/visa', `${req.params.passportNumber}.jpg`),
      path.join(__dirname, '../uploads/documents/visa', `${req.params.passportNumber}.jpeg`),
    ];
    
    // Log all possible paths we're checking
    console.log('Checking these possible file paths:');
    possiblePaths.forEach((p, i) => console.log(`Path ${i+1}:`, p, 'Exists:', fs.existsSync(p)));
    
    // Find the first path that exists
    const filePath = possiblePaths.find(p => fs.existsSync(p));
    
    if (!filePath) {
      console.error('File not found in any of the expected locations');
      return res.status(404).send('File not found on server - please check upload directories');
    }
    
    console.log('Found file at:', filePath);
    
    // Set appropriate content type
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (['.jpg', '.jpeg'].includes(ext)) {
      res.setHeader('Content-Type', 'image/jpeg');
    }
    
    // Return the file
    return res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).send('Server error: ' + error.message);
  }
});


// Delete all documents
router.delete('/all', async (req, res) => {
  try {
    // Delete all records from database
    const result = await PassportVisa.deleteMany({});
    
    // Get folders to clean
    const folderPaths = [
      path.join(__dirname, '../uploads/documents/passport'),
      path.join(__dirname, '../uploads/documents/visa')
    ];
    
    // Delete all files from each folder
    let totalFilesDeleted = 0;
    
    for (const folderPath of folderPaths) {
      // Check if folder exists before attempting to read it
      if (fs.existsSync(folderPath)) {
        // Get all files in the folder
        const files = fs.readdirSync(folderPath);
        console.log(`Found ${files.length} files in ${folderPath}`);
        
        // Delete each file
        for (const file of files) {
          const filePath = path.join(folderPath, file);
          
          // Make sure it's a file and not a directory
          if (fs.statSync(filePath).isFile()) {
            console.log(`Deleting file: ${filePath}`);
            fs.unlinkSync(filePath);
            totalFilesDeleted++;
          }
        }
      } else {
        console.log(`Folder does not exist: ${folderPath}`);
      }
    }
    
    console.log(`Deleted ${result.deletedCount} database records and ${totalFilesDeleted} files`);
    
    res.json({ 
      success: true, 
      message: 'All passport and visa documents deleted successfully',
      deletedCount: result.deletedCount,
      filesDeleted: totalFilesDeleted
    });
  } catch (error) {
    console.error('Error deleting all documents:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete all documents', 
      error: error.message 
    });
  }
});



// Improve the document file serving route
router.get('/document/:id/file', async (req, res) => {
  try {
    console.log(`Requested document ID: ${req.params.id}`);
    
    const document = await PassportVisa.findById(req.params.id);
    
    if (!document) {
      console.error('Document not found with ID:', req.params.id);
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }
    
    console.log('Document found:', document._id, document.name);
    
    // Check if document has file details
    if (!document.fileDetails || !document.fileDetails.path) {
      console.error('No file path in document:', document._id);
      return res.status(404).json({ 
        success: false, 
        message: 'No file associated with this document' 
      });
    }
    
    // Get absolute file path by combining server root with relative path
    const filePath = path.join(__dirname, '..', document.fileDetails.path);
    
    // Debug info
    console.log('Requested file path:', filePath);
    console.log('Document fileDetails:', JSON.stringify(document.fileDetails, null, 2));
    
    // Verify file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found at path:', filePath);
      return res.status(404).json({ 
        success: false, 
        message: 'File not found on server' 
      });
    }
    
    console.log('File exists, preparing to serve');
    
    // Ensure correct Content-Type based on file's mimetype
    let contentType;
    if (document.fileDetails.mimetype === 'application/pdf') {
      contentType = 'application/pdf';
    } else if (document.fileDetails.mimetype === 'image/jpeg') {
      contentType = 'image/jpeg';
    } else {
      contentType = 'application/octet-stream';
    }
    
    console.log('Setting Content-Type:', contentType);
    
    res.setHeader('Content-Type', contentType);
    
    // Set Content-Disposition to 'inline' for browser display
    res.setHeader('Content-Disposition', `inline; filename="${document.fileDetails.filename || document.passportNumber + '.pdf'}"`);
    
    // Send the file
    console.log('Sending file...');
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        return res.status(500).json({
          success: false,
          message: 'Error sending file',
          error: err.message
        });
      }
      console.log('File sent successfully');
    });
    
  } catch (error) {
    console.error('Error serving document file:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to serve document file',
      error: error.message
    });
  }
});

// Get all passport and visa documents
router.get('/', async (req, res) => {
    try {
        // Get all documents
        const documents = await PassportVisa.find({}).sort({ uploadDate: -1 });
        
        // Count unique passport numbers to get actual pilgrim count
        const uniquePassports = [...new Set(documents.map(doc => doc.passportNumber))].filter(Boolean);
        const totalPilgrims = uniquePassports.length;
        
        // Count documents by type and status
        const passportDocuments = await PassportVisa.countDocuments({ 
            documentType: 'Passport',
            status: { $nin: ['Missing'] } // Don't count documents marked as missing
        });
        
        const visaDocuments = await PassportVisa.countDocuments({ 
            documentType: 'Visa',
            status: { $nin: ['Missing'] } // Don't count documents marked as missing
        });
        
        // Count documents explicitly marked as missing
        const explicitlyMissingDocs = await PassportVisa.countDocuments({ 
            status: 'Missing'
        });
        
        // Calculate expected documents (each pilgrim should have both passport and visa)
        const expectedDocs = totalPilgrims * 2;
        
        // Calculate actually missing documents
        // This is either documents explicitly marked as missing + any pilgrims missing either type completely
        const passportMissing = totalPilgrims - passportDocuments;
        const visaMissing = totalPilgrims - visaDocuments;
        
        const missingDocuments = passportMissing + visaMissing;
        
        // Calculate statistics with safeguards for division by zero
        const passportPercentage = totalPilgrims > 0 ? Math.round((passportDocuments / totalPilgrims) * 100) : 0;
        const visaPercentage = totalPilgrims > 0 ? Math.round((visaDocuments / totalPilgrims) * 100) : 0;
        const missingPercentage = expectedDocs > 0 ? Math.round((missingDocuments / expectedDocs) * 100) : 0;
        
        // Return data
        res.status(200).json({
            success: true,
            documents,
            stats: {
                totalPilgrims,
                passportDocuments,
                visaDocuments,
                missingDocuments,
                passportPercentage,
                visaPercentage,
                missingPercentage,
                debug: {
                    explicitlyMissingDocs,
                    passportMissing,
                    visaMissing,
                    expectedDocs
                }
            }
        });
    } catch (error) {
        console.error('Error fetching passport/visa data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch documents',
            error: error.message
        });
    }
});

// Import Excel file
router.post('/import', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
        // Read the Excel file
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        if (!data || data.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Empty or invalid Excel file' 
            });
        }
        
        console.log("Excel data sample:", data[0]); // Log first row for debugging
        
        // Process data and prepare for insertion based on the specific Excel format
        const processedData = data.map(row => {
            // Extract guide and organizer from the "Guide & Organizer" field
            let guide = 'Not Assigned';
            let organizer = 'Noor Al-Fajr';
            
            if (row['Guide & Organizer'] && row['Guide & Organizer'] !== '-') {
                if (row['Guide & Organizer'].includes('/')) {
                    const parts = row['Guide & Organizer'].split('/');
                    guide = parts[0]?.trim() || guide;
                    organizer = parts[1]?.trim() || organizer;
                } else {
                    // If no separator, assume the whole value is the guide name
                    guide = row['Guide & Organizer'].trim();
                }
            }
            
            // Parse the upload date if it exists
            let uploadDate;
            if (row['Upload Date'] && row['Upload Date'] !== '-') {
                try {
                    uploadDate = new Date(row['Upload Date']);
                    
                    // If the date is invalid, default to current date
                    if (isNaN(uploadDate.getTime())) {
                        uploadDate = new Date();
                    }
                } catch (err) {
                    uploadDate = new Date(); // Default to current date
                }
            } else {
                uploadDate = new Date();
            }
            
            // Map status to valid enum values
            let status = row['Status'] || 'Pending';
            
            // Map "Uploaded" to "Complete" if needed
            if (status === 'Uploaded') {
                status = 'Complete';
            }
            
            // Make sure status is one of the valid enum values
            if (!['Complete', 'Missing', 'Pending'].includes(status)) {
                status = 'Pending';
            }
            
            return {
                name: row['Pilgrim Name'] || '',
                passportNumber: row['Passport Number'] || '',
                country: row['Country'] || 'USA',
                guide: guide,
                organizer: organizer,
                documentType: row['Document Type'] || 'Visa',
                uploadDate: uploadDate,
                uploadedBy: row['Uploaded By'] && row['Uploaded By'] !== '-' ? row['Uploaded By'] : 'System Import',
                status: status,
                documentName: 'Younis List',
                createdAt: new Date(),
                updatedAt: new Date()
            };
        });
        
        // Insert into the database
        const insertedDocs = await PassportVisa.insertMany(processedData);
        
        // Delete the uploaded file
        fs.unlinkSync(req.file.path);
        
        res.status(200).json({ 
            success: true, 
            message: 'Data imported successfully', 
            count: insertedDocs.length
        });
        
    } catch (error) {
        console.error('Error importing data:', error);
        
        // Try to remove the file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Failed to import data', 
            error: error.message 
        });
    }
});

// View document (placeholder - would be implemented with actual file retrieval)
router.get('/document/:id', async (req, res) => {
  try {
    const document = await PassportVisa.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    // Check if document has fileDetails
    if (!document.fileDetails || !document.fileDetails.path) {
      return res.status(404).json({ 
        success: false, 
        message: 'No file is associated with this document' 
      });
    }
    
    // Return document details including the file path
    return res.status(200).json({ 
      success: true, 
      document: {
        _id: document._id,
        name: document.name,
        passportNumber: document.passportNumber,
        documentType: document.documentType,
        status: document.status,
        uploadDate: document.uploadDate,
        uploadedBy: document.uploadedBy,
        fileDetails: document.fileDetails
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { passportNumber, documentType } = req.body;
    
    // Find the document
    const document = await PassportVisa.findById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Delete physical file if exists
    let fileDeleted = false;
    try {
      const type = documentType?.toLowerCase() || document.documentType.toLowerCase();
      const pNumber = passportNumber || document.passportNumber;
      
      // Check possible file paths
      const possiblePaths = [
        path.join(__dirname, '../uploads/documents', type, `${pNumber}.pdf`),
        path.join(__dirname, '../uploads/documents/visa', `${pNumber}.pdf`),
        path.join(__dirname, '../uploads/documents/passport', `${pNumber}.pdf`),
        path.join(__dirname, '../uploads/documents', `${pNumber}.pdf`),
        path.join(__dirname, '../uploads/documents', type, `${pNumber}.jpg`),
        path.join(__dirname, '../uploads/documents', type, `${pNumber}.jpeg`)
      ];
      
      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          console.log(`Deleting file: ${filePath}`);
          fs.unlinkSync(filePath);
          fileDeleted = true;
          break;
        }
      }
    } catch (fileErr) {
      console.error('File deletion error:', fileErr);
      // Continue even if file deletion fails
    }
    
    // Delete document from database
    await PassportVisa.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Document deleted successfully',
      fileDeleted
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
});

// Add this simple export route
router.get('/export', async (req, res) => {
  try {
    // Get all documents
    const documents = await PassportVisa.find({}).sort({ uploadDate: -1 });
    
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Passport & Visa Data');
    
    // Define the headers - matching import format exactly
    worksheet.columns = [
      { header: 'Pilgrim Name', key: 'name', width: 20 },
      { header: 'Passport Number', key: 'passportNumber', width: 15 },
      { header: 'Country', key: 'country', width: 12 },
      { header: 'Guide & Organizer', key: 'guideOrganizer', width: 20 },
      { header: 'Document Type', key: 'documentType', width: 12 },
      { header: 'Upload Date', key: 'uploadDate', width: 12 },
      { header: 'Uploaded By', key: 'uploadedBy', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
    ];
    
    // Add data rows
    documents.forEach(doc => {
      // Format date as MM/DD/YYYY
      const uploadDate = doc.uploadDate 
        ? new Date(doc.uploadDate).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          })
        : '';
      
      // Combine guide and organizer with a slash
      const guideOrganizer = `${doc.guide || ''} / ${doc.organizer || 'Noor Al-Fajr'}`.trim();
      
      worksheet.addRow({
        name: doc.name || '',
        passportNumber: doc.passportNumber || '',
        country: doc.country || '',
        guideOrganizer: guideOrganizer,
        documentType: doc.documentType || '',
        uploadDate: uploadDate,
        uploadedBy: doc.uploadedBy || '',
        status: doc.status || '',
      });
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="passport_visa_data_${new Date().toISOString().split('T')[0]}.xlsx"`);
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export data',
      error: error.message 
    });
  }
});

// Add document upload endpoint
router.post('/upload-document', documentUpload.single('file'), async (req, res) => {
  try {
    // Extract data from request
    console.log('POST-MULTER REQUEST BODY:', req.body);
    
    const { pilgrimId, documentType, passportNumber } = req.body;
    
    // Validate required fields
    if (!pilgrimId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: pilgrimId'
      });
    }
    
    // Validate file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file was uploaded'
      });
    }
    
    // Get the document record to update
    const document = await PassportVisa.findById(pilgrimId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document record not found'
      });
    }
    
    // Get file info from the upload
    const { filename, originalname, mimetype, size, path: tempPath } = req.file;
    
    // Determine correct folder based on document type from the database
    const docType = document.documentType.toLowerCase();
    let targetFolder = 'other';
    
    if (docType === 'passport') {
      targetFolder = 'passport';
    } else if (docType === 'visa') {
      targetFolder = 'visa';
    }
    
    // Create target directory if it doesn't exist
    const targetDir = path.join(__dirname, `../uploads/documents/${targetFolder}`);
    fs.mkdirSync(targetDir, { recursive: true });
    
    // Create new filename using passport number
    const fileExt = path.extname(originalname) || '.pdf';
    const newFilename = `${document.passportNumber || 'unknown'}${fileExt}`;
    const targetPath = path.join(targetDir, newFilename);
    
    console.log(`Moving file from ${tempPath} to ${targetPath}`);
    
    // Move the file from temp location to target location
    try {
      // Create a read stream from the source file
      const sourceStream = fs.createReadStream(tempPath);
      
      // Create a write stream to the target file
      const destStream = fs.createWriteStream(targetPath);
      
      // Pipe the source stream to the destination stream
      sourceStream.pipe(destStream);
      
      // Listen for the 'finish' event to know when the copy is complete
      destStream.on('finish', async () => {
        // Now that the file is copied, delete the original
        fs.unlink(tempPath, (err) => {
          if (err) console.error('Error deleting temporary file:', err);
        });
        
        // Calculate the relative path for storage in DB
        const relativePath = targetPath.split('uploads')[1];
        const storagePath = `/uploads${relativePath}`;
        
        // Update document record with file details
        document.status = 'Complete';
        document.uploadDate = new Date();
        document.fileDetails = {
          filename: newFilename,
          originalname,
          mimetype,
          size,
          // Make sure the path starts with "/uploads" for direct browser access
          path: `/uploads/documents/${targetFolder}/${newFilename}`,
          uploadDate: new Date()
        };
        
        // Save the updated document
        await document.save();
        
        // Send success response
        res.status(200).json({
          success: true,
          message: 'Document uploaded successfully',
          document: {
            id: document._id,
            name: document.name,
            passportNumber: document.passportNumber,
            documentType: document.documentType,
            status: document.status,
            fileDetails: document.fileDetails
          }
        });
      });
      
      // Handle errors during the copy
      destStream.on('error', (err) => {
        throw new Error(`Failed to copy file: ${err.message}`);
      });
      
    } catch (err) {
      throw new Error(`Error moving file: ${err.message}`);
    }
    
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
});


// Add this route to create and download a ZIP file
router.get('/download-zip', async (req, res) => {
  try {
    // Create a ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=pilgrim_documents_${new Date().toISOString().split('T')[0]}.zip`);
    
    // Pipe the archive to the response
    archive.pipe(res);
    
    // Define the base path for documents
    const docsBasePath = path.join(__dirname, '../uploads/documents');
    
    // Check if the documents directory exists
    if (!fs.existsSync(docsBasePath)) {
      throw new Error('Documents directory not found');
    }
    
    // Add the passport folder to the archive
    const passportPath = path.join(docsBasePath, 'passport');
    if (fs.existsSync(passportPath)) {
      // Add all files from the passport folder with directory structure
      archive.directory(passportPath, 'passport');
    }
    
    // Add the visa folder to the archive
    const visaPath = path.join(docsBasePath, 'visa');
    if (fs.existsSync(visaPath)) {
      // Add all files from the visa folder with directory structure
      archive.directory(visaPath, 'visa');
    }
    
    // Add the other folder to the archive (if it exists)
    const otherPath = path.join(docsBasePath, 'other');
    if (fs.existsSync(otherPath)) {
      // Add all files from the other folder with directory structure
      archive.directory(otherPath, 'other');
    }
    
    // Finalize the archive
    await archive.finalize();
    
  } catch (error) {
    console.error('Error creating ZIP archive:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ZIP archive',
      error: error.message
    });
  }
});



module.exports = router;