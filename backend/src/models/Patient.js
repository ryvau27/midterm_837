const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const Person = require('./Person');

// Database path
const DB_PATH = path.join(__dirname, '../../../data/upm.db');

class Patient extends Person {
  constructor(data = {}) {
    super(data);
    this.insuranceID = data.insuranceID;
    this.contactInfo = data.contactInfo;
    this.dateOfBirth = data.dateOfBirth;
    this.emergencyContact = data.emergencyContact;
  }

  // Get all patients
  static getAll(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT p.*, person.name, person.role, person.createdAt, person.updatedAt
      FROM Patient p
      JOIN Person person ON p.personID = person.personID
      ORDER BY person.name
    `;

    db.all(sql, [], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new Patient(row)));
      }
    });
  }

  // Get patient by ID
  static getById(personID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT p.*, person.name, person.role, person.createdAt, person.updatedAt
      FROM Patient p
      JOIN Person person ON p.personID = person.personID
      WHERE p.personID = ?
    `;

    db.get(sql, [personID], (err, row) => {
      db.close();
      if (err) {
        callback(err, null);
      } else if (row) {
        callback(null, new Patient(row));
      } else {
        callback(null, null);
      }
    });
  }

  // Search patients by name or insurance ID
  static search(query, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT p.*, person.name, person.role, person.createdAt, person.updatedAt
      FROM Patient p
      JOIN Person person ON p.personID = person.personID
      WHERE person.name LIKE ? OR p.insuranceID LIKE ?
      ORDER BY person.name
    `;

    const searchTerm = `%${query}%`;
    db.all(sql, [searchTerm, searchTerm], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new Patient(row)));
      }
    });
  }

  // Create new patient
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

      // Then create the patient record
      const patientSql = `
        INSERT INTO Patient (personID, insuranceID, contactInfo, dateOfBirth, emergencyContact)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.run(patientSql, [personID, this.insuranceID, this.contactInfo, this.dateOfBirth, this.emergencyContact], function(err) {
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

  // Update patient
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

      // Then update patient record
      const patientSql = `
        UPDATE Patient
        SET insuranceID = ?, contactInfo = ?, dateOfBirth = ?, emergencyContact = ?
        WHERE personID = ?
      `;

      db.run(patientSql, [this.insuranceID, this.contactInfo, this.dateOfBirth, this.emergencyContact, this.personID], function(err) {
        db.close();
        if (err) {
          callback(err, null);
        } else {
          callback(null, this.changes > 0);
        }
      });
    });
  }

  // Get patient's complete medical record
  getMedicalRecord(callback) {
    const db = new sqlite3.Database(DB_PATH);

    // Get patient basic info
    const patientSql = `
      SELECT p.*, person.name, person.role
      FROM Patient p
      JOIN Person person ON p.personID = person.personID
      WHERE p.personID = ?
    `;

    db.get(patientSql, [this.personID], (err, patientRow) => {
      if (err) {
        db.close();
        callback(err, null);
        return;
      }

      if (!patientRow) {
        db.close();
        callback(null, null);
        return;
      }

      // Get patient records
      const recordsSql = `
        SELECT * FROM PatientRecord
        WHERE patientID = ?
        ORDER BY dateCreated DESC
      `;

      db.all(recordsSql, [this.personID], (err, records) => {
        if (err) {
          db.close();
          callback(err, null);
          return;
        }

        const result = {
          patient: patientRow,
          records: []
        };

        if (records.length === 0) {
          db.close();
          callback(null, result);
          return;
        }

        // For each record, get visits
        let completedRecords = 0;
        records.forEach(record => {
          const visitsSql = `
            SELECT v.*, p.name as physicianName
            FROM Visit v
            LEFT JOIN Physician phys ON v.physicianID = phys.personID
            LEFT JOIN Person p ON phys.personID = p.personID
            WHERE v.patientRecordID = ?
            ORDER BY v.visitDate DESC
          `;

          db.all(visitsSql, [record.recordID], (err, visits) => {
            if (err) {
              db.close();
              callback(err, null);
              return;
            }

            record.visits = visits || [];

            // For each visit, get vital signs and prescriptions
            let completedVisits = 0;
            visits.forEach(visit => {
              // Get vital signs
              const vitalsSql = 'SELECT * FROM VitalSign WHERE visitID = ? ORDER BY timestamp DESC';
              db.all(vitalsSql, [visit.visitID], (err, vitals) => {
                if (err) {
                  db.close();
                  callback(err, null);
                  return;
                }

                visit.vitalSigns = vitals || [];

                // Get prescriptions
                const prescriptionsSql = 'SELECT * FROM Prescription WHERE visitID = ? ORDER BY startDate DESC';
                db.all(prescriptionsSql, [visit.visitID], (err, prescriptions) => {
                  if (err) {
                    db.close();
                    callback(err, null);
                    return;
                  }

                  visit.prescriptions = prescriptions || [];

                  completedVisits++;
                  if (completedVisits === visits.length) {
                    completedRecords++;
                    if (completedRecords === records.length) {
                      result.records = records;
                      db.close();
                      callback(null, result);
                    }
                  }
                });
              });
            });

            if (visits.length === 0) {
              completedRecords++;
              if (completedRecords === records.length) {
                result.records = records;
                db.close();
                callback(null, result);
              }
            }
          });
        });
      });
    });
  }
}

module.exports = Patient;
