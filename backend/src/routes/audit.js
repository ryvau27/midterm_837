const express = require('express');
const AuditLog = require('../models/AuditLog');
const SystemAdministrator = require('../models/SystemAdministrator');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateUser);

// GET /api/audit/logs - Get audit logs with filtering (Admin only)
router.get('/logs', authorizeRole(['admin']), (req, res) => {
  const adminID = req.user.personID;

  // Verify administrator exists and has audit access
  SystemAdministrator.getById(adminID, (err, admin) => {
    if (err) {
      console.error('Administrator lookup error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error verifying administrator access'
      });
    }

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: 'Administrator account not found'
      });
    }

    if (!admin.hasAccess('audit_only')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to access audit logs'
      });
    }

    // Parse filter parameters
    const filters = {};
    const { startDate, endDate, userType, actionType, page, limit } = req.query;

    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        filters.startDate = start.toISOString();
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        filters.endDate = end.toISOString();
      }
    }

    if (userType && userType !== 'all') {
      filters.userRole = userType;
    }

    if (actionType && actionType !== 'all') {
      filters.actionType = actionType;
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 50, 100); // Max 100 per page
    const offset = (pageNum - 1) * limitNum;

    filters.limit = limitNum;
    filters.offset = offset;

    // Get filtered audit logs
    AuditLog.getFiltered(filters, (err, logs) => {
      if (err) {
        console.error('Audit log retrieval error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving audit logs'
        });
      }

      // Get total count for pagination
      AuditLog.getFilteredCount(filters, (err, totalCount) => {
        if (err) {
          console.error('Audit log count error:', err);
          // Continue without pagination info
          return res.json({
            success: true,
            data: logs || [],
            pagination: {
              page: pageNum,
              limit: limitNum,
              total: logs ? logs.length : 0
            }
          });
        }

        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({
          success: true,
          data: logs || [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalCount,
            totalPages: totalPages,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
          }
        });
      });
    });
  });
});

// GET /api/audit/stats - Get audit log statistics (Admin only)
router.get('/stats', authorizeRole(['admin']), (req, res) => {
  const adminID = req.user.personID;

  // Verify administrator has access
  SystemAdministrator.getById(adminID, (err, admin) => {
    if (err) {
      console.error('Administrator lookup error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error verifying administrator access'
      });
    }

    if (!admin || !admin.hasAccess('audit_only')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to access audit statistics'
      });
    }

    // Get audit statistics
    AuditLog.getStats((err, stats) => {
      if (err) {
        console.error('Audit stats error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving audit statistics'
        });
      }

      res.json({
        success: true,
        data: stats || {
          totalLogs: 0,
          loginAttempts: 0,
          failedLogins: 0,
          successfulLogins: 0,
          recentActivity: [],
          activityByRole: {},
          activityByHour: {}
        }
      });
    });
  });
});

// GET /api/audit/logs/recent - Get recent audit logs (Admin only)
router.get('/logs/recent', authorizeRole(['admin']), (req, res) => {
  const adminID = req.user.personID;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 recent logs

  // Verify administrator has access
  SystemAdministrator.getById(adminID, (err, admin) => {
    if (err) {
      console.error('Administrator lookup error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error verifying administrator access'
      });
    }

    if (!admin || !admin.hasAccess('audit_only')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to access audit logs'
      });
    }

    // Get recent logs
    AuditLog.getRecent(limit, (err, logs) => {
      if (err) {
        console.error('Recent audit logs error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving recent audit logs'
        });
      }

      res.json({
        success: true,
        data: logs || []
      });
    });
  });
});

// GET /api/audit/export - Export audit logs (Admin with full access only)
router.get('/export', authorizeRole(['admin']), (req, res) => {
  const adminID = req.user.personID;

  // Verify administrator has full access for export
  SystemAdministrator.getById(adminID, (err, admin) => {
    if (err) {
      console.error('Administrator lookup error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error verifying administrator access'
      });
    }

    if (!admin || admin.accessLevel !== 'full') {
      return res.status(403).json({
        success: false,
        message: 'Full administrator access required for data export'
      });
    }

    // Parse filter parameters for export
    const filters = {};
    const { startDate, endDate, userType, actionType, format } = req.query;

    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        filters.startDate = start.toISOString();
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        filters.endDate = end.toISOString();
      }
    }

    if (userType && userType !== 'all') {
      filters.userRole = userType;
    }

    if (actionType && actionType !== 'all') {
      filters.actionType = actionType;
    }

    // Get all matching logs for export (no pagination)
    AuditLog.getFiltered({ ...filters, limit: 10000 }, (err, logs) => {
      if (err) {
        console.error('Audit log export error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error exporting audit logs'
        });
      }

      const exportFormat = format || 'json';

      if (exportFormat === 'csv') {
        // Convert to CSV
        const csvHeader = 'Log ID,Timestamp,User ID,User Name,User Role,Action Type,IP Address\n';
        const csvData = logs.map(log =>
          `${log.logID},"${log.timestamp}","${log.userID}","${log.userName || ''}","${log.userRole}","${log.actionType}","${log.ipAddress || ''}"`
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
        res.send(csvHeader + csvData);
      } else {
        // Default JSON export
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.json"');
        res.json({
          exportDate: new Date().toISOString(),
          totalRecords: logs.length,
          filters: filters,
          data: logs
        });
      }
    });
  });
});

// POST /api/audit/logs - Manually create audit log entry (for testing, Admin only)
router.post('/logs', authorizeRole(['admin']), (req, res) => {
  const adminID = req.user.personID;
  const { userID, userRole, actionType, ipAddress } = req.body;

  // Verify administrator has full access
  SystemAdministrator.getById(adminID, (err, admin) => {
    if (err) {
      console.error('Administrator lookup error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error verifying administrator access'
      });
    }

    if (!admin || admin.accessLevel !== 'full') {
      return res.status(403).json({
        success: false,
        message: 'Full administrator access required to create audit logs'
      });
    }

    // Validate required fields
    if (!userID || !userRole || !actionType) {
      return res.status(400).json({
        success: false,
        message: 'userID, userRole, and actionType are required'
      });
    }

    // Create audit log entry
    const auditLog = new AuditLog({
      userID: userID,
      userRole: userRole,
      actionType: actionType,
      ipAddress: ipAddress || req.ip || 'unknown'
    });

    auditLog.save((err, result) => {
      if (err) {
        console.error('Audit log creation error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error creating audit log entry'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Audit log entry created',
        data: {
          logID: result.lastID,
          timestamp: new Date().toISOString()
        }
      });
    });
  });
});

module.exports = router;
