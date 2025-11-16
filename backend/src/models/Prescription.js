const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Database path
const DB_PATH = path.join(__dirname, '../../../data/upm.db');

class Prescription {
  constructor(data = {}) {
    this.prescriptionID = data.prescriptionID;
    this.visitID = data.visitID;
    this.medicationName = data.medicationName;
    this.dosage = data.dosage;
    this.frequency = data.frequency;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.instructions = data.instructions;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Get all prescriptions
  static getAll(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT pres.*, v.visitDate, p.name as patientName
      FROM Prescription pres
      LEFT JOIN Visit v ON pres.visitID = v.visitID
      LEFT JOIN PatientRecord pr ON v.patientRecordID = pr.recordID
      LEFT JOIN Patient pat ON pr.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      ORDER BY pres.startDate DESC
    `;

    db.all(sql, [], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new Prescription(row)));
      }
    });
  }

  // Get prescriptions by visit ID
  static getByVisitId(visitID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT pres.*, v.visitDate, p.name as patientName
      FROM Prescription pres
      LEFT JOIN Visit v ON pres.visitID = v.visitID
      LEFT JOIN PatientRecord pr ON v.patientRecordID = pr.recordID
      LEFT JOIN Patient pat ON pr.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      WHERE pres.visitID = ?
      ORDER BY pres.startDate DESC
    `;

    db.all(sql, [visitID], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new Prescription(row)));
      }
    });
  }

  // Get prescriptions by patient ID
  static getByPatientId(patientID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT pres.*, v.visitDate, p.name as patientName
      FROM Prescription pres
      LEFT JOIN Visit v ON pres.visitID = v.visitID
      LEFT JOIN PatientRecord pr ON v.patientRecordID = pr.recordID
      LEFT JOIN Patient pat ON pr.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      WHERE pr.patientID = ?
      ORDER BY pres.startDate DESC
    `;

    db.all(sql, [patientID], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new Prescription(row)));
      }
    });
  }

  // Get active prescriptions for patient (current date between start and end)
  static getActiveByPatientId(patientID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const currentDate = new Date().toISOString().split('T')[0];

    const sql = `
      SELECT pres.*, v.visitDate, p.name as patientName
      FROM Prescription pres
      LEFT JOIN Visit v ON pres.visitID = v.visitID
      LEFT JOIN PatientRecord pr ON v.patientRecordID = pr.recordID
      LEFT JOIN Patient pat ON pr.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      WHERE pr.patientID = ? AND pres.startDate <= ? AND (pres.endDate IS NULL OR pres.endDate >= ?)
      ORDER BY pres.startDate DESC
    `;

    db.all(sql, [patientID, currentDate, currentDate], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new Prescription(row)));
      }
    });
  }

  // Create new prescription
  save(callback) {
    // Basic validation
    if (!this.medicationName || !this.dosage || !this.frequency || !this.startDate) {
      callback(new Error('Medication name, dosage, frequency, and start date are required'), null);
      return;
    }

    // Validate date formats
    const startDate = new Date(this.startDate);
    if (isNaN(startDate.getTime())) {
      callback(new Error('Invalid start date format'), null);
      return;
    }

    if (this.endDate) {
      const endDate = new Date(this.endDate);
      if (isNaN(endDate.getTime())) {
        callback(new Error('Invalid end date format'), null);
        return;
      }
      if (endDate < startDate) {
        callback(new Error('End date must be after start date'), null);
        return;
      }
    }

    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      INSERT INTO Prescription (visitID, medicationName, dosage, frequency, startDate, endDate, instructions)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      this.visitID,
      this.medicationName,
      this.dosage,
      this.frequency,
      this.startDate,
      this.endDate,
      this.instructions
    ], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        this.prescriptionID = this.lastID;
        callback(null, this);
      }
    });
  }

  // Update prescription
  update(callback) {
    // Basic validation
    if (!this.medicationName || !this.dosage || !this.frequency || !this.startDate) {
      callback(new Error('Medication name, dosage, frequency, and start date are required'), null);
      return;
    }

    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      UPDATE Prescription
      SET medicationName = ?, dosage = ?, frequency = ?, startDate = ?, endDate = ?, instructions = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE prescriptionID = ?
    `;

    db.run(sql, [
      this.medicationName,
      this.dosage,
      this.frequency,
      this.startDate,
      this.endDate,
      this.instructions,
      this.prescriptionID
    ], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, this.changes > 0);
      }
    });
  }

  // Delete prescription
  static delete(prescriptionID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    db.run('DELETE FROM Prescription WHERE prescriptionID = ?', [prescriptionID], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, this.changes > 0);
      }
    });
  }
}

module.exports = Prescription;
