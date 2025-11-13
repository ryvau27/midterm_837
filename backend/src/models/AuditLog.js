const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Database path
const DB_PATH = path.join(__dirname, '../../../data/upm.db');

class AuditLog {
  constructor(data = {}) {
    this.logID = data.logID;
    this.timestamp = data.timestamp;
    this.userID = data.userID;
    this.userRole = data.userRole;
    this.actionType = data.actionType;
    this.ipAddress = data.ipAddress;
    this.createdAt = data.createdAt;
  }

  // Get all audit logs
  static getAll(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT al.*, p.name as userName
      FROM AuditLog al
      LEFT JOIN Person p ON al.userID = p.personID
      ORDER BY al.timestamp DESC
    `;

    db.all(sql, [], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new AuditLog(row)));
      }
    });
  }

  // Get audit logs with filtering
  static getFiltered(filters = {}, callback) {
    const db = new sqlite3.Database(DB_PATH);

    let sql = `
      SELECT al.*, p.name as userName
      FROM AuditLog al
      LEFT JOIN Person p ON al.userID = p.personID
      WHERE 1=1
    `;
    const params = [];

    if (filters.startDate) {
      sql += ' AND al.timestamp >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ' AND al.timestamp <= ?';
      params.push(filters.endDate);
    }

    if (filters.userType && filters.userType !== 'all') {
      sql += ' AND al.userRole = ?';
      params.push(filters.userType);
    }

    if (filters.actionType && filters.actionType !== 'all') {
      sql += ' AND al.actionType = ?';
      params.push(filters.actionType);
    }

    sql += ' ORDER BY al.timestamp DESC';

    // Add pagination if specified
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    db.all(sql, params, (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new AuditLog(row)));
      }
    });
  }

  // Get audit logs by user ID
  static getByUserId(userID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT al.*, p.name as userName
      FROM AuditLog al
      LEFT JOIN Person p ON al.userID = p.personID
      WHERE al.userID = ?
      ORDER BY al.timestamp DESC
    `;

    db.all(sql, [userID], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new AuditLog(row)));
      }
    });
  }

  // Get audit logs by action type
  static getByActionType(actionType, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT al.*, p.name as userName
      FROM AuditLog al
      LEFT JOIN Person p ON al.userID = p.personID
      WHERE al.actionType = ?
      ORDER BY al.timestamp DESC
    `;

    db.all(sql, [actionType], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new AuditLog(row)));
      }
    });
  }

  // Create new audit log entry
  save(callback) {
    // Validate required fields
    if (!this.userID || !this.userRole || !this.actionType) {
      callback(new Error('userID, userRole, and actionType are required'), null);
      return;
    }

    // Validate action type
    const validActions = ['LOGIN', 'LOGIN_FAILED'];
    if (!validActions.includes(this.actionType)) {
      callback(new Error(`Invalid action type. Must be one of: ${validActions.join(', ')}`), null);
      return;
    }

    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      INSERT INTO AuditLog (timestamp, userID, userRole, actionType, ipAddress)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      this.timestamp || new Date().toISOString(),
      this.userID,
      this.userRole,
      this.actionType,
      this.ipAddress || 'unknown'
    ], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        this.logID = this.lastID;
        callback(null, this);
      }
    });
  }

  // Delete audit log (admin only, rarely used)
  static delete(logID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    db.run('DELETE FROM AuditLog WHERE logID = ?', [logID], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, this.changes > 0);
      }
    });
  }

  // Get login statistics
  static getLoginStats(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT
        COUNT(*) as totalLogins,
        COUNT(CASE WHEN actionType = 'LOGIN' THEN 1 END) as successfulLogins,
        COUNT(CASE WHEN actionType = 'LOGIN_FAILED' THEN 1 END) as failedLogins,
        COUNT(DISTINCT userID) as uniqueUsers
      FROM AuditLog
      WHERE actionType IN ('LOGIN', 'LOGIN_FAILED')
    `;

    db.get(sql, [], (err, row) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, row);
      }
    });
  }
}

module.exports = AuditLog;
