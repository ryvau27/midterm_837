const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Database path
const DB_PATH = path.join(__dirname, '../../../data/upm.db');

class PatientRecord {
  constructor(data = {}) {
    this.recordID = data.recordID;
    this.patientID = data.patientID;
    this.dateCreated = data.dateCreated;
    this.status = data.status;
    this.primaryPhysicianID = data.primaryPhysicianID;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Get all patient records
  static getAll(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT pr.*, p.name as patientName, phys.name as physicianName
      FROM PatientRecord pr
      LEFT JOIN Patient pat ON pr.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      LEFT JOIN Physician phys_doc ON pr.primaryPhysicianID = phys_doc.personID
      LEFT JOIN Person phys ON phys_doc.personID = phys.personID
      ORDER BY pr.dateCreated DESC
    `;

    db.all(sql, [], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new PatientRecord(row)));
      }
    });
  }

  // Get patient record by ID
  static getById(recordID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT pr.*, p.name as patientName, phys.name as physicianName
      FROM PatientRecord pr
      LEFT JOIN Patient pat ON pr.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      LEFT JOIN Physician phys_doc ON pr.primaryPhysicianID = phys_doc.personID
      LEFT JOIN Person phys ON phys_doc.personID = phys.personID
      WHERE pr.recordID = ?
    `;

    db.get(sql, [recordID], (err, row) => {
      db.close();
      if (err) {
        callback(err, null);
      } else if (row) {
        callback(null, new PatientRecord(row));
      } else {
        callback(null, null);
      }
    });
  }

  // Get patient records by patient ID
  static getByPatientId(patientID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT pr.*, p.name as patientName, phys.name as physicianName
      FROM PatientRecord pr
      LEFT JOIN Patient pat ON pr.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      LEFT JOIN Physician phys_doc ON pr.primaryPhysicianID = phys_doc.personID
      LEFT JOIN Person phys ON phys_doc.personID = phys.personID
      WHERE pr.patientID = ?
      ORDER BY pr.dateCreated DESC
    `;

    db.all(sql, [patientID], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new PatientRecord(row)));
      }
    });
  }

  // Get patient records by physician ID
  static getByPhysicianId(physicianID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT pr.*, p.name as patientName, phys.name as physicianName
      FROM PatientRecord pr
      LEFT JOIN Patient pat ON pr.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      LEFT JOIN Physician phys_doc ON pr.primaryPhysicianID = phys_doc.personID
      LEFT JOIN Person phys ON phys_doc.personID = phys.personID
      WHERE pr.primaryPhysicianID = ?
      ORDER BY pr.dateCreated DESC
    `;

    db.all(sql, [physicianID], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new PatientRecord(row)));
      }
    });
  }

  // Create new patient record
  save(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      INSERT INTO PatientRecord (patientID, dateCreated, status, primaryPhysicianID)
      VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [this.patientID, this.dateCreated || new Date().toISOString(), this.status || 'active', this.primaryPhysicianID], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        this.recordID = this.lastID;
        callback(null, this);
      }
    });
  }

  // Update patient record
  update(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      UPDATE PatientRecord
      SET status = ?, primaryPhysicianID = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE recordID = ?
    `;

    db.run(sql, [this.status, this.primaryPhysicianID, this.recordID], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, this.changes > 0);
      }
    });
  }

  // Delete patient record
  static delete(recordID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    db.run('DELETE FROM PatientRecord WHERE recordID = ?', [recordID], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, this.changes > 0);
      }
    });
  }

  // Get visits for this record
  getVisits(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT v.*, p.name as physicianName
      FROM Visit v
      LEFT JOIN Physician phys ON v.physicianID = phys.personID
      LEFT JOIN Person p ON phys.personID = p.personID
      WHERE v.patientRecordID = ?
      ORDER BY v.visitDate DESC
    `;

    db.all(sql, [this.recordID], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  }
}

module.exports = PatientRecord;
