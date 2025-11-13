const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Database path
const DB_PATH = path.join(__dirname, '../../../data/upm.db');

class BillingSummary {
  constructor(data = {}) {
    this.billingID = data.billingID;
    this.visitID = data.visitID;
    this.patientID = data.patientID;
    this.totalCost = data.totalCost;
    this.billingDate = data.billingDate;
    this.status = data.status || 'pending';
    this.insuranceProviderID = data.insuranceProviderID;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Valid billing statuses
  static get VALID_STATUSES() {
    return ['pending', 'submitted', 'paid', 'denied'];
  }

  // Get all billing summaries
  static getAll(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT bs.*, v.visitDate, v.reason, p.name as patientName,
             ip.providerName, phys.name as physicianName
      FROM BillingSummary bs
      LEFT JOIN Visit v ON bs.visitID = v.visitID
      LEFT JOIN Patient pat ON bs.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      LEFT JOIN InsuranceProvider ip ON bs.insuranceProviderID = ip.providerID
      LEFT JOIN Physician phys_doc ON v.physicianID = phys_doc.personID
      LEFT JOIN Person phys ON phys_doc.personID = phys.personID
      ORDER BY bs.billingDate DESC
    `;

    db.all(sql, [], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new BillingSummary(row)));
      }
    });
  }

  // Get billing summary by ID
  static getById(billingID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT bs.*, v.visitDate, v.reason, p.name as patientName,
             ip.providerName, phys.name as physicianName
      FROM BillingSummary bs
      LEFT JOIN Visit v ON bs.visitID = v.visitID
      LEFT JOIN Patient pat ON bs.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      LEFT JOIN InsuranceProvider ip ON bs.insuranceProviderID = ip.providerID
      LEFT JOIN Physician phys_doc ON v.physicianID = phys_doc.personID
      LEFT JOIN Person phys ON phys_doc.personID = phys.personID
      WHERE bs.billingID = ?
    `;

    db.get(sql, [billingID], (err, row) => {
      db.close();
      if (err) {
        callback(err, null);
      } else if (row) {
        callback(null, new BillingSummary(row));
      } else {
        callback(null, null);
      }
    });
  }

  // Get billing summaries by physician ID (for unbilled visits)
  static getByPhysicianId(physicianID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT bs.*, v.visitDate, v.reason, p.name as patientName,
             ip.providerName, phys.name as physicianName
      FROM BillingSummary bs
      LEFT JOIN Visit v ON bs.visitID = v.visitID
      LEFT JOIN Patient pat ON bs.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      LEFT JOIN InsuranceProvider ip ON bs.insuranceProviderID = ip.providerID
      LEFT JOIN Physician phys_doc ON v.physicianID = phys_doc.personID
      LEFT JOIN Person phys ON phys_doc.personID = phys.personID
      WHERE v.physicianID = ?
      ORDER BY bs.billingDate DESC
    `;

    db.all(sql, [physicianID], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new BillingSummary(row)));
      }
    });
  }

  // Get billing summaries by status
  static getByStatus(status, callback) {
    if (!BillingSummary.VALID_STATUSES.includes(status)) {
      callback(new Error(`Invalid status: ${status}`), null);
      return;
    }

    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT bs.*, v.visitDate, v.reason, p.name as patientName,
             ip.providerName, phys.name as physicianName
      FROM BillingSummary bs
      LEFT JOIN Visit v ON bs.visitID = v.visitID
      LEFT JOIN Patient pat ON bs.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      LEFT JOIN InsuranceProvider ip ON bs.insuranceProviderID = ip.providerID
      LEFT JOIN Physician phys_doc ON v.physicianID = phys_doc.personID
      LEFT JOIN Person phys ON phys_doc.personID = phys.personID
      WHERE bs.status = ?
      ORDER BY bs.billingDate DESC
    `;

    db.all(sql, [status], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new BillingSummary(row)));
      }
    });
  }

  // Check if visit already has billing
  static visitHasBilling(visitID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    db.get('SELECT billingID FROM BillingSummary WHERE visitID = ?', [visitID], (err, row) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, !!row);
      }
    });
  }

  // Validate billing data
  static validateBillingData(data) {
    const errors = [];

    if (!data.visitID || isNaN(parseInt(data.visitID))) {
      errors.push('Valid visit ID is required');
    }

    if (!data.patientID || isNaN(parseInt(data.patientID))) {
      errors.push('Valid patient ID is required');
    }

    if (!data.totalCost || isNaN(parseFloat(data.totalCost)) || parseFloat(data.totalCost) <= 0) {
      errors.push('Total cost must be a positive number');
    }

    if (data.status && !BillingSummary.VALID_STATUSES.includes(data.status)) {
      errors.push(`Status must be one of: ${BillingSummary.VALID_STATUSES.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Create new billing summary
  save(callback) {
    // Validate data first
    const validation = BillingSummary.validateBillingData(this);
    if (!validation.isValid) {
      callback(new Error(validation.errors.join(', ')), null);
      return;
    }

    // Check if visit already has billing
    BillingSummary.visitHasBilling(this.visitID, (err, hasBilling) => {
      if (err) {
        callback(err, null);
        return;
      }

      if (hasBilling) {
        callback(new Error('Visit already has billing summary'), null);
        return;
      }

      const db = new sqlite3.Database(DB_PATH);
      const sql = `
        INSERT INTO BillingSummary (visitID, patientID, totalCost, billingDate, status, insuranceProviderID)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.run(sql, [
        this.visitID,
        this.patientID,
        this.totalCost,
        this.billingDate || new Date().toISOString(),
        this.status || 'pending',
        this.insuranceProviderID
      ], function(err) {
        db.close();
        if (err) {
          callback(err, null);
        } else {
          this.billingID = this.lastID;
          callback(null, this);
        }
      });
    });
  }

  // Update billing summary
  update(callback) {
    if (!this.billingID) {
      callback(new Error('Billing ID is required for update'), null);
      return;
    }

    // Validate data
    const validation = BillingSummary.validateBillingData(this);
    if (!validation.isValid) {
      callback(new Error(validation.errors.join(', ')), null);
      return;
    }

    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      UPDATE BillingSummary
      SET totalCost = ?, status = ?, insuranceProviderID = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE billingID = ?
    `;

    db.run(sql, [this.totalCost, this.status, this.insuranceProviderID, this.billingID], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, this.changes > 0);
      }
    });
  }

  // Delete billing summary
  static delete(billingID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    db.run('DELETE FROM BillingSummary WHERE billingID = ?', [billingID], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, this.changes > 0);
      }
    });
  }

  // Get billing summary with full visit details
  getFullDetails(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT bs.*, v.visitDate, v.reason, v.notes,
             p.name as patientName, p.dateOfBirth,
             pat.insuranceID,
             ip.providerName, ip.contactInfo as providerContact,
             phys.name as physicianName,
             phys_doc.licenseNumber, phys_doc.specialty
      FROM BillingSummary bs
      LEFT JOIN Visit v ON bs.visitID = v.visitID
      LEFT JOIN Patient pat ON bs.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      LEFT JOIN InsuranceProvider ip ON bs.insuranceProviderID = ip.providerID
      LEFT JOIN Physician phys_doc ON v.physicianID = phys_doc.personID
      LEFT JOIN Person phys ON phys_doc.personID = phys.personID
      WHERE bs.billingID = ?
    `;

    db.get(sql, [this.billingID], (err, row) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, row);
      }
    });
  }
}

module.exports = BillingSummary;
