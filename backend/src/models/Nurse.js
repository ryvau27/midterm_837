const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const Person = require('./Person');

// Database path
const DB_PATH = path.join(__dirname, '../../../data/upm.db');

class Nurse extends Person {
  constructor(data = {}) {
    super(data);
    this.certification = data.certification;
    this.department = data.department;
    this.shift = data.shift;
  }

  // Get all nurses
  static getAll(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT n.*, person.name, person.role, person.createdAt, person.updatedAt
      FROM Nurse n
      JOIN Person person ON n.personID = person.personID
      ORDER BY person.name
    `;

    db.all(sql, [], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new Nurse(row)));
      }
    });
  }

  // Get nurse by ID
  static getById(personID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT n.*, person.name, person.role, person.createdAt, person.updatedAt
      FROM Nurse n
      JOIN Person person ON n.personID = person.personID
      WHERE n.personID = ?
    `;

    db.get(sql, [personID], (err, row) => {
      db.close();
      if (err) {
        callback(err, null);
      } else if (row) {
        callback(null, new Nurse(row));
      } else {
        callback(null, null);
      }
    });
  }

  // Get nurses by department
  static getByDepartment(department, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT n.*, person.name, person.role, person.createdAt, person.updatedAt
      FROM Nurse n
      JOIN Person person ON n.personID = person.personID
      WHERE n.department = ?
      ORDER BY person.name
    `;

    db.all(sql, [department], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new Nurse(row)));
      }
    });
  }

  // Get nurses by shift
  static getByShift(shift, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT n.*, person.name, person.role, person.createdAt, person.updatedAt
      FROM Nurse n
      JOIN Person person ON n.personID = person.personID
      WHERE n.shift = ?
      ORDER BY person.name
    `;

    db.all(sql, [shift], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new Nurse(row)));
      }
    });
  }

  // Create new nurse
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

      // Then create the nurse record
      const nurseSql = `
        INSERT INTO Nurse (personID, certification, department, shift)
        VALUES (?, ?, ?, ?)
      `;

      db.run(nurseSql, [personID, this.certification, this.department, this.shift], function(err) {
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

  // Update nurse
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

      // Then update nurse record
      const nurseSql = `
        UPDATE Nurse
        SET certification = ?, department = ?, shift = ?
        WHERE personID = ?
      `;

      db.run(nurseSql, [this.certification, this.department, this.shift, this.personID], function(err) {
        db.close();
        if (err) {
          callback(err, null);
        } else {
          callback(null, this.changes > 0);
        }
      });
    });
  }

  // Get nurse's recorded vital signs
  getRecordedVitals(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT vs.*, v.visitID, v.visitDate, v.reason,
             p.personID as patientID, p.name as patientName
      FROM VitalSign vs
      JOIN Visit v ON vs.visitID = v.visitID
      JOIN PatientRecord pr ON v.patientRecordID = pr.recordID
      JOIN Patient pat ON pr.patientID = pat.personID
      JOIN Person p ON pat.personID = p.personID
      WHERE vs.recordedBy = ?
      ORDER BY vs.timestamp DESC
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

module.exports = Nurse;
