const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Database path
const DB_PATH = path.join(__dirname, '../../../data/upm.db');

// Login audit logging middleware
const logLoginAttempt = async (username, role, success, ipAddress = 'unknown') => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);

        const actionType = success ? 'LOGIN' : 'LOGIN_FAILED';

        const sql = `
            INSERT INTO AuditLog (userID, userRole, actionType, ipAddress)
            VALUES (?, ?, ?, ?)
        `;

        // For demo purposes, we'll use a simple mapping to get userID
        // In a real app, this would be looked up from the users table
        const userIdMap = {
            'dr.smith': 1,
            'john.doe': 2,
            'nurse.jane': 3,
            'admin': 4
        };

        const userID = userIdMap[username] || 0;

        db.run(sql, [userID, role, actionType, ipAddress], function(err) {
            db.close();

            if (err) {
                console.error('Audit logging error:', err);
                reject(err);
            } else {
                console.log(`Login ${success ? 'success' : 'failure'} logged for user: ${username}`);
                resolve();
            }
        });
    });
};

// Middleware to log login attempts
const auditLogin = (req, res, next) => {
    // Store original response methods
    const originalJson = res.json;
    const originalStatus = res.status;

    // Override res.status to capture status code
    res.status = function(code) {
        res.statusCode = code;
        return originalStatus.call(this, code);
    };

    // Override res.json to log after response
    res.json = function(data) {
        // Extract login information from request
        let username = '';
        let role = '';

        if (req.body && req.body.username) {
            username = req.body.username;
            // In a real app, role would be determined after authentication
            // For demo, we'll map from known users
            const userRoleMap = {
                'dr.smith': 'physician',
                'john.doe': 'patient',
                'nurse.jane': 'nurse',
                'admin': 'admin'
            };
            role = userRoleMap[username] || 'unknown';
        }

        const success = res.statusCode === 200 && data && data.success;
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

        // Log asynchronously (don't block response)
        logLoginAttempt(username, role, success, ipAddress).catch(err => {
            console.error('Failed to log login attempt:', err);
        });

        // Call original method
        return originalJson.call(this, data);
    };

    next();
};

module.exports = {
    auditLogin,
    logLoginAttempt
};
