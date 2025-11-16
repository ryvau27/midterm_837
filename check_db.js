const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'data/upm.db');
const db = new sqlite3.Database(DB_PATH);

console.log('Checking visit-patient relationships...');

db.all(`
  SELECT v.visitID, v.patientRecordID, pr.recordID, pr.patientID, p.name as patientName
  FROM Visit v
  LEFT JOIN PatientRecord pr ON v.patientRecordID = pr.recordID
  LEFT JOIN Patient pat ON pr.patientID = pat.personID
  LEFT JOIN Person p ON pat.personID = p.personID
`, (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Visit-Patient relationships:');
    rows.forEach(row => {
      console.log(`Visit ${row.visitID}: patientRecordID=${row.patientRecordID}, patientID=${row.patientID}, patientName=${row.patientName}`);
    });
  }

  db.close();
});
