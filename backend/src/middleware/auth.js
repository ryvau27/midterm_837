const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Database path
const DB_PATH = path.join(__dirname, '../../../data/upm.db');

// Pre-configured users (in a real app, this would be in the database with hashed passwords)
const USERS = {
    'dr.smith': { password: 'physician123', role: 'physician', personID: 1 },
    'john.doe': { password: 'patient123', role: 'patient', personID: 2 },
    'nurse.jane': { password: 'nurse123', role: 'nurse', personID: 3 },
    'admin': { password: 'admin123', role: 'admin', personID: 4 }
};

// Role-based access control mapping
const ROLE_PERMISSIONS = {
    physician: ['/api/patients/search', '/api/patients/:id', '/api/visits/unbilled', '/api/billing/generate'],
    patient: ['/api/patients/me'],
    nurse: ['/api/patients/:patientId/vitals'],
    admin: ['/api/audit/logs']
};

// Simple authentication middleware
const authenticateUser = (req, res, next) => {
    try {
        // In a real app, this would be a JWT token or session
        // For this demo, we expect user data in a custom header or body
        let user = null;

        // Check for user data in various places
        if (req.headers['x-user-data']) {
            user = JSON.parse(req.headers['x-user-data']);
        } else if (req.body && req.body.user) {
            user = req.body.user;
        }

        if (!user || !user.username || !user.role) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Verify user credentials (simple check for demo)
        const expectedUser = USERS[user.username];
        if (!expectedUser || expectedUser.role !== user.role) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Attach user to request
        req.user = {
            personID: expectedUser.personID,
            username: user.username,
            role: user.role
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

// Role-based authorization middleware
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

// Endpoint-specific authorization middleware
const authorizeEndpoint = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const requestedPath = req.route ? req.route.path : req.path;
    const userRole = req.user.role;

    // Check if user's role has permission for this endpoint
    const allowedEndpoints = ROLE_PERMISSIONS[userRole] || [];

    // Check if the requested path matches any allowed pattern
    const hasPermission = allowedEndpoints.some(allowedPath => {
        // Convert :param to wildcard match
        const pattern = allowedPath.replace(/:\w+/g, '[^/]+');
        const regex = new RegExp(`^${pattern}`);
        return regex.test(requestedPath);
    });

    if (!hasPermission) {
        return res.status(403).json({
            success: false,
            message: 'Access denied for this resource'
        });
    }

    next();
};

// Patient data isolation middleware (for patient role)
const isolatePatientData = (req, res, next) => {
    if (req.user && req.user.role === 'patient') {
        // For patient role, ensure they can only access their own data
        const requestedPatientId = req.params.patientId || req.params.id;

        if (requestedPatientId && parseInt(requestedPatientId) !== req.user.personID) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Can only view own data'
            });
        }
    }
    next();
};

module.exports = {
    authenticateUser,
    authorizeRole,
    authorizeEndpoint,
    isolatePatientData
};
