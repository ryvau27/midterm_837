const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Database path
const DB_PATH = path.join(__dirname, '../../../data/upm.db');

class VitalSign {
  constructor(data = {}) {
    this.vitalID = data.vitalID;
    this.visitID = data.visitID;
    this.measureType = data.measureType;
    this.value = data.value;
    this.unit = data.unit;
    this.timestamp = data.timestamp;
    this.recordedBy = data.recordedBy;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Validation rules for vital signs
  static validateVitalSign(measureType, value, unit) {
    const rules = {
      temperature: {
        min: 95.0,
        max: 105.0,
        unit: '°F'
      },
      blood_pressure: {
        // For blood pressure, we expect systolic/diastolic format like "120/80"
        pattern: /^\d{2,3}\/\d{2,3}$/,
        unit: 'mmHg'
      },
      heart_rate: {
        min: 40,
        max: 200,
        unit: 'bpm'
      },
      respiratory_rate: {
        min: 8,
        max: 40,
        unit: 'breaths/min'
      },
      weight: {
        min: 50,
        max: 500,
        unit: ['lbs', 'kg']
      },
      height: {
        min: 24,
        max: 84,
        unit: ['inches', 'cm']
      }
    };

    const rule = rules[measureType];
    if (!rule) {
      return { valid: false, error: `Unknown measure type: ${measureType}` };
    }

    // Check unit
    if (rule.unit instanceof Array) {
      if (!rule.unit.includes(unit)) {
        return { valid: false, error: `Invalid unit for ${measureType}. Expected: ${rule.unit.join(' or ')}` };
      }
    } else if (unit !== rule.unit) {
      return { valid: false, error: `Invalid unit for ${measureType}. Expected: ${rule.unit}` };
    }

    // Special handling for blood pressure
    if (measureType === 'blood_pressure') {
      if (!rule.pattern.test(value)) {
        return { valid: false, error: 'Blood pressure must be in format: systolic/diastolic (e.g., 120/80)' };
      }
      const [systolic, diastolic] = value.split('/').map(Number);
      if (systolic < 80 || systolic > 200 || diastolic < 50 || diastolic > 120) {
        return { valid: false, error: 'Blood pressure values out of range (systolic: 80-200, diastolic: 50-120)' };
      }
    } else {
      // Numeric validation for other types
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < rule.min || numValue > rule.max) {
        return { valid: false, error: `${measureType} must be between ${rule.min} and ${rule.max} ${unit}` };
      }
    }

    return { valid: true };
  }

  // Get all vital signs
  static getAll(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT vs.*, v.visitDate, p.name as patientName, recorder.name as recordedByName
      FROM VitalSign vs
      LEFT JOIN Visit v ON vs.visitID = v.visitID
      LEFT JOIN PatientRecord pr ON v.patientRecordID = pr.recordID
      LEFT JOIN Patient pat ON pr.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      LEFT JOIN Person recorder ON vs.recordedBy = recorder.personID
      ORDER BY vs.timestamp DESC
    `;

    db.all(sql, [], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new VitalSign(row)));
      }
    });
  }

  // Get vital signs by visit ID
  static getByVisitId(visitID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT vs.*, v.visitDate, p.name as patientName, recorder.name as recordedByName
      FROM VitalSign vs
      LEFT JOIN Visit v ON vs.visitID = v.visitID
      LEFT JOIN PatientRecord pr ON v.patientRecordID = pr.recordID
      LEFT JOIN Patient pat ON pr.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      LEFT JOIN Person recorder ON vs.recordedBy = recorder.personID
      WHERE vs.visitID = ?
      ORDER BY vs.timestamp DESC
    `;

    db.all(sql, [visitID], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new VitalSign(row)));
      }
    });
  }

  // Get vital signs by patient ID
  static getByPatientId(patientID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      SELECT vs.*, v.visitDate, p.name as patientName, recorder.name as recordedByName
      FROM VitalSign vs
      LEFT JOIN Visit v ON vs.visitID = v.visitID
      LEFT JOIN PatientRecord pr ON v.patientRecordID = pr.recordID
      LEFT JOIN Patient pat ON pr.patientID = pat.personID
      LEFT JOIN Person p ON pat.personID = p.personID
      LEFT JOIN Person recorder ON vs.recordedBy = recorder.personID
      WHERE pr.patientID = ?
      ORDER BY vs.timestamp DESC
    `;

    db.all(sql, [patientID], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new VitalSign(row)));
      }
    });
  }

  // Create new vital sign
  save(callback) {
    // Validate the vital sign first
    const validation = VitalSign.validateVitalSign(this.measureType, this.value, this.unit);
    if (!validation.valid) {
      callback(new Error(validation.error), null);
      return;
    }

    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      INSERT INTO VitalSign (visitID, measureType, value, unit, timestamp, recordedBy)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      this.visitID,
      this.measureType,
      this.value,
      this.unit,
      this.timestamp || new Date().toISOString(),
      this.recordedBy
    ], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        this.vitalID = this.lastID;
        callback(null, this);
      }
    });
  }

  // Update vital sign
  update(callback) {
    // Validate the vital sign first
    const validation = VitalSign.validateVitalSign(this.measureType, this.value, this.unit);
    if (!validation.valid) {
      callback(new Error(validation.error), null);
      return;
    }

    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      UPDATE VitalSign
      SET value = ?, unit = ?, recordedBy = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE vitalID = ?
    `;

    db.run(sql, [this.value, this.unit, this.recordedBy, this.vitalID], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, this.changes > 0);
      }
    });
  }

  // Delete vital sign
  static delete(vitalID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    db.run('DELETE FROM VitalSign WHERE vitalID = ?', [vitalID], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, this.changes > 0);
      }
    });
  }
}

module.exports = VitalSign;
