const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const Person = require('./Person');

// Database path
const DB_PATH = path.join(__dirname, '../../../data/upm.db');

class SystemAdministrator extends Person {
  constructor(data = {}) {
    super(data);
    this.accessLevel = data.accessLevel || 'readonly';
    this.assignedRegion = data.assignedRegion;
    this.lastLogin = data.lastLogin;
  }

  // Valid access levels
  static get VALID_ACCESS_LEVELS() {
    return ['full', 'readonly', 'audit_only'];
  }

  // Get all system administrators
  static getAll(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT sa.*, person.name, person.role, person.createdAt, person.updatedAt
      FROM SystemAdministrator sa
      JOIN Person person ON sa.personID = person.personID
      ORDER BY person.name
    `;

    db.all(sql, [], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new SystemAdministrator(row)));
      }
    });
  }

  // Get system administrator by ID
  static getById(personID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT sa.*, person.name, person.role, person.createdAt, person.updatedAt
      FROM SystemAdministrator sa
      JOIN Person person ON sa.personID = person.personID
      WHERE sa.personID = ?
    `;

    db.get(sql, [personID], (err, row) => {
      db.close();
      if (err) {
        callback(err, null);
      } else if (row) {
        callback(null, new SystemAdministrator(row));
      } else {
        callback(null, null);
      }
    });
  }

  // Get system administrators by access level
  static getByAccessLevel(accessLevel, callback) {
    if (!SystemAdministrator.VALID_ACCESS_LEVELS.includes(accessLevel)) {
      callback(new Error(`Invalid access level: ${accessLevel}`), null);
      return;
    }

    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT sa.*, person.name, person.role, person.createdAt, person.updatedAt
      FROM SystemAdministrator sa
      JOIN Person person ON sa.personID = person.personID
      WHERE sa.accessLevel = ?
      ORDER BY person.name
    `;

    db.all(sql, [accessLevel], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new SystemAdministrator(row)));
      }
    });
  }

  // Validate system administrator data
  static validateAdminData(data) {
    const errors = [];

    if (data.accessLevel && !SystemAdministrator.VALID_ACCESS_LEVELS.includes(data.accessLevel)) {
      errors.push(`Access level must be one of: ${SystemAdministrator.VALID_ACCESS_LEVELS.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Create new system administrator
  save(callback) {
    // Validate data first
    const validation = SystemAdministrator.validateAdminData(this);
    if (!validation.isValid) {
      callback(new Error(validation.errors.join(', ')), null);
      return;
    }

    const db = new sqlite3.Database(DB_PATH);

    // First create the person record
    const personSql = 'INSERT INTO Person (name, role) VALUES (?, ?)';
    db.run(personSql, [this.name, this.role], function(err) {
      if (err) {
        db.close();
        callback(err, null);
        return;
      }

      const personID = this.lastID;

      // Then create the system administrator record
      const adminSql = `
        INSERT INTO SystemAdministrator (personID, accessLevel, assignedRegion)
        VALUES (?, ?, ?)
      `;

      db.run(adminSql, [personID, this.accessLevel, this.assignedRegion], function(err) {
        db.close();
        if (err) {
          callback(err, null);
        } else {
          this.personID = personID;
          callback(null, this);
        }
      });
    });
  }

  // Update system administrator
  update(callback) {
    if (!this.personID) {
      callback(new Error('Person ID is required for update'), null);
      return;
    }

    // Validate data
    const validation = SystemAdministrator.validateAdminData(this);
    if (!validation.isValid) {
      callback(new Error(validation.errors.join(', ')), null);
      return;
    }

    const db = new sqlite3.Database(DB_PATH);

    // Update person record first
    const personSql = 'UPDATE Person SET name = ?, updatedAt = CURRENT_TIMESTAMP WHERE personID = ?';
    db.run(personSql, [this.name, this.personID], (err) => {
      if (err) {
        db.close();
        callback(err, null);
        return;
      }

      // Then update system administrator record
      const adminSql = `
        UPDATE SystemAdministrator
        SET accessLevel = ?, assignedRegion = ?, lastLogin = ?
        WHERE personID = ?
      `;

      db.run(adminSql, [this.accessLevel, this.assignedRegion, this.lastLogin, this.personID], function(err) {
        db.close();
        if (err) {
          callback(err, null);
        } else {
          callback(null, this.changes > 0);
        }
      });
    });
  }

  // Update last login time
  updateLastLogin(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      UPDATE SystemAdministrator
      SET lastLogin = CURRENT_TIMESTAMP
      WHERE personID = ?
    `;

    db.run(sql, [this.personID], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        this.lastLogin = new Date().toISOString();
        callback(null, this.changes > 0);
      }
    });
  }

  // Check if administrator has specific access level
  hasAccess(accessLevel) {
    if (this.accessLevel === 'full') {
      return true; // Full access to everything
    }

    if (accessLevel === 'readonly' && ['readonly', 'audit_only'].includes(this.accessLevel)) {
      return true;
    }

    if (accessLevel === 'audit_only' && this.accessLevel === 'audit_only') {
      return true;
    }

    return false;
  }

  // Get administrator's access permissions
  getPermissions() {
    const permissions = {
      canViewAuditLogs: this.accessLevel === 'full' || this.accessLevel === 'audit_only',
      canViewSystemSettings: this.accessLevel === 'full',
      canManageUsers: this.accessLevel === 'full',
      canViewReports: this.accessLevel === 'full' || this.accessLevel === 'readonly'
    };

    return permissions;
  }

  // Get audit logs accessible by this administrator
  getAccessibleAuditLogs(filters = {}, callback) {
    // Administrators with audit_only access can only see audit logs
    // Administrators with readonly access can see logs but not modify
    // Administrators with full access can see and potentially modify
    if (!this.hasAccess('audit_only') && !this.hasAccess('readonly')) {
      callback(new Error('Insufficient permissions to access audit logs'), null);
      return;
    }

    // Use the existing AuditLog filtering
    const AuditLog = require('./AuditLog');
    AuditLog.getFiltered(filters, callback);
  }
}

module.exports = SystemAdministrator;
