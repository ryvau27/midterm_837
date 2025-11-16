const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const Person = require('./Person');

// Database path
const DB_PATH = path.join(__dirname, '../../../data/upm.db');

class Physician extends Person {
  constructor(data = {}) {
    super(data);
    this.licenseNumber = data.licenseNumber;
    this.specialty = data.specialty;
    this.department = data.department;
  }

  // Get all physicians
  static getAll(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT p.*, person.name, person.role, person.createdAt, person.updatedAt
      FROM Physician p
      JOIN Person person ON p.personID = person.personID
      ORDER BY person.name
    `;

    db.all(sql, [], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new Physician(row)));
      }
    });
  }

  // Get physician by ID
  static getById(personID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT p.*, person.name, person.role, person.createdAt, person.updatedAt
      FROM Physician p
      JOIN Person person ON p.personID = person.personID
      WHERE p.personID = ?
    `;

    db.get(sql, [personID], (err, row) => {
      db.close();
      if (err) {
        callback(err, null);
      } else if (row) {
        callback(null, new Physician(row));
      } else {
        callback(null, null);
      }
    });
  }

  // Get physician by license number
  static getByLicense(licenseNumber, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT p.*, person.name, person.role, person.createdAt, person.updatedAt
      FROM Physician p
      JOIN Person person ON p.personID = person.personID
      WHERE p.licenseNumber = ?
    `;

    db.get(sql, [licenseNumber], (err, row) => {
      db.close();
      if (err) {
        callback(err, null);
      } else if (row) {
        callback(null, new Physician(row));
      } else {
        callback(null, null);
      }
    });
  }

  // Get physicians by specialty
  static getBySpecialty(specialty, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT p.*, person.name, person.role, person.createdAt, person.updatedAt
      FROM Physician p
      JOIN Person person ON p.personID = person.personID
      WHERE p.specialty = ?
      ORDER BY person.name
    `;

    db.all(sql, [specialty], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new Physician(row)));
      }
    });
  }

  // Create new physician
  save(callback) {
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

      // Then create the physician record
      const physicianSql = `
        INSERT INTO Physician (personID, licenseNumber, specialty, department)
        VALUES (?, ?, ?, ?)
      `;

      db.run(physicianSql, [personID, this.licenseNumber, this.specialty, this.department], function(err) {
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

  // Update physician
  update(callback) {
    const db = new sqlite3.Database(DB_PATH);

    // Update person record first
    const personSql = 'UPDATE Person SET name = ?, updatedAt = CURRENT_TIMESTAMP WHERE personID = ?';
    db.run(personSql, [this.name, this.personID], (err) => {
      if (err) {
        db.close();
        callback(err, null);
        return;
      }

      // Then update physician record
      const physicianSql = `
        UPDATE Physician
        SET licenseNumber = ?, specialty = ?, department = ?
        WHERE personID = ?
      `;

      db.run(physicianSql, [this.licenseNumber, this.specialty, this.department, this.personID], function(err) {
        db.close();
        if (err) {
          callback(err, null);
        } else {
          callback(null, this.changes > 0);
        }
      });
    });
  }

  // Get physician's patients
  getPatients(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT DISTINCT pat.*, person.name, person.role
      FROM Patient pat
      JOIN Person person ON pat.personID = person.personID
      JOIN PatientRecord pr ON pat.personID = pr.patientID
      WHERE pr.primaryPhysicianID = ?
      ORDER BY person.name
    `;

    db.all(sql, [this.personID], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  }
}

module.exports = Physician;
