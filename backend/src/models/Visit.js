const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Database path
const DB_PATH = path.join(__dirname, '../../../data/upm.db');

class Visit {
  constructor(data = {}) {
    this.visitID = data.visitID;
    this.patientRecordID = data.patientRecordID;
    this.visitDate = data.visitDate;
    this.reason = data.reason;
    this.physicianID = data.physicianID;
    this.notes = data.notes;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Get all visits
  static getAll(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT v.*, pr.patientID, p.name as patientName, phys.name as physicianName
      FROM Visit v
      LEFT JOIN PatientRecord pr ON v.patientRecordID = pr.recordID
      LEFT JOIN Patient pat ON pr.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      LEFT JOIN Physician phys_doc ON v.physicianID = phys_doc.personID
      LEFT JOIN Person phys ON phys_doc.personID = phys.personID
      ORDER BY v.visitDate DESC
    `;

    db.all(sql, [], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new Visit(row)));
      }
    });
  }

  // Get visit by ID
  static getById(visitID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT v.*, pr.patientID, p.name as patientName, phys.name as physicianName
      FROM Visit v
      LEFT JOIN PatientRecord pr ON v.patientRecordID = pr.recordID
      LEFT JOIN Patient pat ON pr.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      LEFT JOIN Physician phys_doc ON v.physicianID = phys_doc.personID
      LEFT JOIN Person phys ON phys_doc.personID = phys.personID
      WHERE v.visitID = ?
    `;

    db.get(sql, [visitID], (err, row) => {
      db.close();
      if (err) {
        callback(err, null);
      } else if (row) {
        callback(null, new Visit(row));
      } else {
        callback(null, null);
      }
    });
  }

  // Get visits by patient record ID
  static getByPatientRecordId(patientRecordID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT v.*, pr.patientID, p.name as patientName, phys.name as physicianName
      FROM Visit v
      LEFT JOIN PatientRecord pr ON v.patientRecordID = pr.recordID
      LEFT JOIN Patient pat ON pr.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      LEFT JOIN Physician phys_doc ON v.physicianID = phys_doc.personID
      LEFT JOIN Person phys ON phys_doc.personID = phys.personID
      WHERE v.patientRecordID = ?
      ORDER BY v.visitDate DESC
    `;

    db.all(sql, [patientRecordID], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new Visit(row)));
      }
    });
  }

  // Get visits by physician ID
  static getByPhysicianId(physicianID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT v.*, pr.patientID, p.name as patientName, phys.name as physicianName
      FROM Visit v
      LEFT JOIN PatientRecord pr ON v.patientRecordID = pr.recordID
      LEFT JOIN Patient pat ON pr.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      LEFT JOIN Physician phys_doc ON v.physicianID = phys_doc.personID
      LEFT JOIN Person phys ON phys_doc.personID = phys.personID
      WHERE v.physicianID = ?
      ORDER BY v.visitDate DESC
    `;

    db.all(sql, [physicianID], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new Visit(row)));
      }
    });
  }

  // Get unbilled visits for a physician
  static getUnbilledVisits(physicianID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT v.visitID, v.visitDate, v.reason, pr.patientID, p.name as patientName,
             150.00 as estimatedCost
      FROM Visit v
      LEFT JOIN PatientRecord pr ON v.patientRecordID = pr.recordID
      LEFT JOIN Patient pat ON pr.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      WHERE v.physicianID = ? AND v.visitID NOT IN (
        SELECT visitID FROM BillingSummary
      )
      ORDER BY v.visitDate DESC
    `;

    db.all(sql, [physicianID], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  }

  // Create new visit
  save(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      INSERT INTO Visit (patientRecordID, visitDate, reason, physicianID, notes, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      this.patientRecordID,
      this.visitDate,
      this.reason,
      this.physicianID,
      this.notes,
      this.status || 'completed'
    ], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        this.visitID = this.lastID;
        callback(null, this);
      }
    });
  }

  // Update visit
  update(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      UPDATE Visit
      SET visitDate = ?, reason = ?, physicianID = ?, notes = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE visitID = ?
    `;

    db.run(sql, [
      this.visitDate,
      this.reason,
      this.physicianID,
      this.notes,
      this.status,
      this.visitID
    ], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, this.changes > 0);
      }
    });
  }

  // Delete visit
  static delete(visitID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    db.run('DELETE FROM Visit WHERE visitID = ?', [visitID], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, this.changes > 0);
      }
    });
  }

  // Get vital signs for this visit
  getVitalSigns(callback) {
    const db = new sqlite3.Database(DB_PATH);
    db.all('SELECT * FROM VitalSign WHERE visitID = ? ORDER BY timestamp DESC', [this.visitID], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  }

  // Get prescriptions for this visit
  getPrescriptions(callback) {
    const db = new sqlite3.Database(DB_PATH);
    db.all('SELECT * FROM Prescription WHERE visitID = ? ORDER BY startDate DESC', [this.visitID], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  }
}

module.exports = Visit;
