const jwt = require('jsonwebtoken');

// Middleware function to verify JWT token
function auth(req, res, next) {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    try {
        // Decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtSecretKey');
        
        // Make sure we have organizationId in the decoded data
        console.log('Decoded token:', decoded);
        
        // Set user data including organizationId
        req.user = {
            id: decoded.id,
            email: decoded.email,
            // Only include organizationId if it exists in token
            ...(decoded.organizationId ? { organizationId: decoded.organizationId } : {}),
            // Make sure createdBy is available for filtering guides
            createdBy: decoded.id // Use user ID as createdBy for filtering guides
        };
        
        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        res.status(401).json({ message: 'Token is not valid' });
    }
}

module.exports = auth;