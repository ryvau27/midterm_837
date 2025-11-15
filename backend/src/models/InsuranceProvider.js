const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Database path
const DB_PATH = path.join(__dirname, '../../../data/upm.db');

class InsuranceProvider {
  constructor(data = {}) {
    this.providerID = data.providerID;
    this.providerName = data.providerName;
    this.contactInfo = data.contactInfo;
    this.apiEndpoint = data.apiEndpoint;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Get all insurance providers
  static getAll(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT ip.providerID,
             ip.providerName,
             ip.contactInfo,
             ip.apiEndpoint,
             ip.createdAt,
             ip.updatedAt,
             COUNT(bs.billingID) as totalBillings,
             COUNT(CASE WHEN bs.status = 'paid' THEN 1 END) as paidBillings,
             SUM(CASE WHEN bs.status = 'paid' THEN bs.totalCost ELSE 0 END) as totalPaidAmount
      FROM InsuranceProvider ip
      LEFT JOIN BillingSummary bs ON ip.providerID = bs.insuranceProviderID
      GROUP BY ip.providerID, ip.providerName, ip.contactInfo, ip.apiEndpoint, ip.createdAt, ip.updatedAt
      ORDER BY ip.providerName
    `;

    db.all(sql, [], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new InsuranceProvider(row)));
      }
    });
  }

  // Get insurance provider by ID
  static getById(providerID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT ip.providerID,
             ip.providerName,
             ip.contactInfo,
             ip.apiEndpoint,
             ip.createdAt,
             ip.updatedAt,
             COUNT(bs.billingID) as totalBillings,
             COUNT(CASE WHEN bs.status = 'paid' THEN 1 END) as paidBillings,
             SUM(CASE WHEN bs.status = 'paid' THEN bs.totalCost ELSE 0 END) as totalPaidAmount
      FROM InsuranceProvider ip
      LEFT JOIN BillingSummary bs ON ip.providerID = bs.insuranceProviderID
      WHERE ip.providerID = ?
      GROUP BY ip.providerID, ip.providerName, ip.contactInfo, ip.apiEndpoint, ip.createdAt, ip.updatedAt
    `;

    db.get(sql, [providerID], (err, row) => {
      db.close();
      if (err) {
        callback(err, null);
      } else if (row) {
        callback(null, new InsuranceProvider(row));
      } else {
        callback(null, null);
      }
    });
  }

  // Get insurance provider by name
  static getByName(providerName, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT ip.providerID,
             ip.providerName,
             ip.contactInfo,
             ip.apiEndpoint,
             ip.createdAt,
             ip.updatedAt,
             COUNT(bs.billingID) as totalBillings,
             COUNT(CASE WHEN bs.status = 'paid' THEN 1 END) as paidBillings,
             SUM(CASE WHEN bs.status = 'paid' THEN bs.totalCost ELSE 0 END) as totalPaidAmount
      FROM InsuranceProvider ip
      LEFT JOIN BillingSummary bs ON ip.providerID = bs.insuranceProviderID
      WHERE ip.providerName = ?
      GROUP BY ip.providerID, ip.providerName, ip.contactInfo, ip.apiEndpoint, ip.createdAt, ip.updatedAt
    `;

    db.get(sql, [providerName], (err, row) => {
      db.close();
      if (err) {
        callback(err, null);
      } else if (row) {
        callback(null, new InsuranceProvider(row));
      } else {
        callback(null, null);
      }
    });
  }

  // Validate insurance provider data
  static validateProviderData(data) {
    const errors = [];

    if (!data.providerName || data.providerName.trim().length === 0) {
      errors.push('Provider name is required');
    } else if (data.providerName.length > 100) {
      errors.push('Provider name must be 100 characters or less');
    }

    if (data.contactInfo) {
      try {
        JSON.parse(data.contactInfo);
      } catch (e) {
        errors.push('Contact info must be valid JSON format');
      }
    }

    if (data.apiEndpoint && !data.apiEndpoint.match(/^https?:\/\/.+/)) {
      errors.push('API endpoint must be a valid HTTP/HTTPS URL');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Create new insurance provider
  save(callback) {
    // Validate data first
    const validation = InsuranceProvider.validateProviderData(this);
    if (!validation.isValid) {
      callback(new Error(validation.errors.join(', ')), null);
      return;
    }

    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      INSERT INTO InsuranceProvider (providerName, contactInfo, apiEndpoint)
      VALUES (?, ?, ?)
    `;

    db.run(sql, [
      this.providerName.trim(),
      this.contactInfo,
      this.apiEndpoint
    ], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        this.providerID = this.lastID;
        callback(null, this);
      }
    });
  }

  // Update insurance provider
  update(callback) {
    if (!this.providerID) {
      callback(new Error('Provider ID is required for update'), null);
      return;
    }

    // Validate data
    const validation = InsuranceProvider.validateProviderData(this);
    if (!validation.isValid) {
      callback(new Error(validation.errors.join(', ')), null);
      return;
    }

    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      UPDATE InsuranceProvider
      SET providerName = ?, contactInfo = ?, apiEndpoint = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE providerID = ?
    `;

    db.run(sql, [
      this.providerName.trim(),
      this.contactInfo,
      this.apiEndpoint,
      this.providerID
    ], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, this.changes > 0);
      }
    });
  }

  // Delete insurance provider (only if no associated billings)
  static delete(providerID, callback) {
    const db = new sqlite3.Database(DB_PATH);

    // Check if provider has any associated billings
    db.get('SELECT COUNT(*) as count FROM BillingSummary WHERE insuranceProviderID = ?', [providerID], (err, row) => {
      if (err) {
        db.close();
        callback(err, null);
        return;
      }

      if (row.count > 0) {
        db.close();
        callback(new Error('Cannot delete provider with associated billings'), null);
        return;
      }

      // Safe to delete
      db.run('DELETE FROM InsuranceProvider WHERE providerID = ?', [providerID], function(err) {
        db.close();
        if (err) {
          callback(err, null);
        } else {
          callback(null, this.changes > 0);
        }
      });
    });
  }

  // Get provider's billing summaries
  getBillingSummaries(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT bs.*, v.visitDate, v.reason, p.name as patientName
      FROM BillingSummary bs
      LEFT JOIN Visit v ON bs.visitID = v.visitID
      LEFT JOIN Patient pat ON bs.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      WHERE bs.insuranceProviderID = ?
      ORDER BY bs.billingDate DESC
    `;

    db.all(sql, [this.providerID], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  }

  // Mock insurance submission (for demo purposes)
  submitBilling(billingSummary, callback) {
    // Simulate external API call
    setTimeout(() => {
      const responses = [
        { success: true, status: 'accepted', message: 'Claim submitted successfully' },
        { success: true, status: 'accepted', message: 'Claim received and processing' },
        { success: false, status: 'rejected', message: 'Invalid claim format' },
        { success: false, status: 'rejected', message: 'Patient not covered' }
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      // Simulate occasional delays
      if (Math.random() < 0.3) {
        setTimeout(() => callback(null, randomResponse), Math.random() * 2000 + 1000);
      } else {
        callback(null, randomResponse);
      }
    }, Math.random() * 1000 + 500); // 0.5-1.5 second delay
  }
}

module.exports = InsuranceProvider;
