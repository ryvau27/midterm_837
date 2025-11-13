const express = require('express');
const { auditLogin } = require('../middleware/audit');

const router = express.Router();

// Pre-configured users (in a real app, this would be in the database)
const USERS = {
    'dr.smith': { password: 'physician123', role: 'physician', personID: 1, name: 'Dr. Smith' },
    'john.doe': { password: 'patient123', role: 'patient', personID: 2, name: 'John Doe' },
    'nurse.jane': { password: 'nurse123', role: 'nurse', personID: 3, name: 'Nurse Jane' },
    'admin': { password: 'admin123', role: 'admin', personID: 4, name: 'Admin User' }
};

// Login endpoint (public)
router.post('/login', auditLogin, (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }

    // Check if user exists
    const user = USERS[username];
    if (!user) {
        // User doesn't exist - log failed attempt
        return res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }

    // Check password (plain text comparison as per requirements)
    if (password !== user.password) {
        // Wrong password - log failed attempt
        return res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }

    // Successful login - return user info (will be logged by auditLogin middleware)
    const userInfo = {
        personID: user.personID,
        username,
        role: user.role,
        name: user.name
    };

    res.json({
        success: true,
        data: { user: userInfo },
        message: 'Login successful'
    });
});

// Logout endpoint (authenticated users)
router.post('/logout', (req, res) => {
    // In a real app, you might invalidate tokens here
    // For this demo, just return success
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
