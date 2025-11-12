const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, '../../../data/upm.db');

console.log('Seeding database with initial data...');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to database for seeding.');
});

// Seed data
const seedData = {
    persons: [
        { personID: 1, name: 'Dr. Smith', role: 'physician' },
        { personID: 2, name: 'John Doe', role: 'patient' },
        { personID: 3, name: 'Nurse Jane', role: 'nurse' },
        { personID: 4, name: 'Admin User', role: 'admin' },
        { personID: 5, name: 'Dr. Johnson', role: 'physician' },
        { personID: 6, name: 'Jane Smith', role: 'patient' }
    ],

    physicians: [
        { personID: 1, licenseNumber: 'MD12345', specialty: 'Internal Medicine', department: 'Internal Medicine' },
        { personID: 5, licenseNumber: 'MD67890', specialty: 'Cardiology', department: 'Cardiology' }
    ],

    patients: [
        {
            personID: 2,
            insuranceID: 'INS123456',
            contactInfo: JSON.stringify({ phone: '555-0123', email: 'john.doe@example.com', address: '123 Main St' }),
            dateOfBirth: '1980-01-15',
            emergencyContact: JSON.stringify({ name: 'Jane Doe', phone: '555-0124', relationship: 'Spouse' })
        },
        {
            personID: 6,
            insuranceID: 'INS789012',
            contactInfo: JSON.stringify({ phone: '555-0567', email: 'jane.smith@example.com', address: '456 Oak Ave' }),
            dateOfBirth: '1975-03-20',
            emergencyContact: JSON.stringify({ name: 'Bob Smith', phone: '555-0568', relationship: 'Spouse' })
        }
    ],

    nurses: [
        { personID: 3, certification: 'RN-BC', department: 'Medical/Surgical', shift: 'day' }
    ],

    admins: [
        { personID: 4, accessLevel: 'full', assignedRegion: 'All Hospitals' }
    ],

    patientRecords: [
        { recordID: 1, patientID: 2, dateCreated: '2025-01-15', status: 'active', primaryPhysicianID: 1 },
        { recordID: 2, patientID: 6, dateCreated: '2025-02-01', status: 'active', primaryPhysicianID: 5 }
    ],

    visits: [
        {
            visitID: 1,
            patientRecordID: 1,
            visitDate: '2025-01-15T10:00:00',
            reason: 'Annual physical examination',
            physicianID: 1,
            notes: 'Patient reports feeling well',
            status: 'completed'
        },
        {
            visitID: 2,
            patientRecordID: 1,
            visitDate: '2025-06-15T14:30:00',
            reason: 'Follow-up for hypertension',
            physicianID: 1,
            notes: 'Blood pressure improved with medication',
            status: 'completed'
        },
        {
            visitID: 3,
            patientRecordID: 2,
            visitDate: '2025-02-01T09:15:00',
            reason: 'Initial cardiology consultation',
            physicianID: 5,
            notes: 'Patient concerned about chest pain',
            status: 'completed'
        }
    ],

    vitalSigns: [
        {
            vitalID: 1,
            visitID: 1,
            measureType: 'blood_pressure',
            value: 120,
            unit: 'mmHg systolic',
            timestamp: '2025-01-15T10:15:00',
            recordedBy: 3
        },
        {
            vitalID: 2,
            visitID: 1,
            measureType: 'heart_rate',
            value: 72,
            unit: 'bpm',
            timestamp: '2025-01-15T10:15:00',
            recordedBy: 3
        },
        {
            vitalID: 3,
            visitID: 1,
            measureType: 'temperature',
            value: 98.6,
            unit: '°F',
            timestamp: '2025-01-15T10:15:00',
            recordedBy: 3
        },
        {
            vitalID: 4,
            visitID: 2,
            measureType: 'blood_pressure',
            value: 118,
            unit: 'mmHg systolic',
            timestamp: '2025-06-15T14:45:00',
            recordedBy: 3
        },
        {
            vitalID: 5,
            visitID: 3,
            measureType: 'heart_rate',
            value: 78,
            unit: 'bpm',
            timestamp: '2025-02-01T09:30:00',
            recordedBy: 3
        }
    ],

    prescriptions: [
        {
            prescriptionID: 1,
            visitID: 1,
            medicationName: 'Lisinopril',
            dosage: '10mg',
            frequency: 'once daily',
            startDate: '2025-01-15',
            endDate: '2025-12-31',
            instructions: 'Take with food'
        },
        {
            prescriptionID: 2,
            visitID: 2,
            medicationName: 'Amlodipine',
            dosage: '5mg',
            frequency: 'once daily',
            startDate: '2025-06-15',
            endDate: '2025-12-31',
            instructions: 'Take in the morning'
        },
        {
            prescriptionID: 3,
            visitID: 3,
            medicationName: 'Aspirin',
            dosage: '81mg',
            frequency: 'once daily',
            startDate: '2025-02-01',
            instructions: 'Take with water'
        }
    ],

    insuranceProviders: [
        {
            providerID: 1,
            providerName: 'HealthFirst Insurance',
            contactInfo: JSON.stringify({ phone: '800-123-4567', email: 'claims@healthfirst.com' }),
            apiEndpoint: 'http://mock-insurance-api/healthfirst'
        }
    ],

    billingSummaries: [
        {
            billingID: 1,
            visitID: 1,
            patientID: 2,
            totalCost: 150.00,
            billingDate: '2025-01-15T16:00:00',
            status: 'paid',
            insuranceProviderID: 1
        }
    ]
};

// Helper function to run queries with promises
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
}

// Clear existing data (in reverse dependency order)
async function clearData() {
    const tables = [
        'AuditLog', 'BillingSummary', 'Prescription', 'VitalSign', 'Visit',
        'PatientRecord', 'InsuranceProvider', 'SystemAdministrator', 'Nurse',
        'Physician', 'Patient', 'Person'
    ];

    for (const table of tables) {
        await runQuery(`DELETE FROM ${table}`);
    }
    console.log('Cleared existing data.');
}

// Insert seed data
async function insertSeedData() {
    try {
        // Insert persons
        for (const person of seedData.persons) {
            await runQuery(
                'INSERT OR REPLACE INTO Person (personID, name, role) VALUES (?, ?, ?)',
                [person.personID, person.name, person.role]
            );
        }
        console.log('Inserted persons.');

        // Insert physicians
        for (const physician of seedData.physicians) {
            await runQuery(
                'INSERT OR REPLACE INTO Physician (personID, licenseNumber, specialty, department) VALUES (?, ?, ?, ?)',
                [physician.personID, physician.licenseNumber, physician.specialty, physician.department]
            );
        }
        console.log('Inserted physicians.');

        // Insert patients
        for (const patient of seedData.patients) {
            await runQuery(
                'INSERT OR REPLACE INTO Patient (personID, insuranceID, contactInfo, dateOfBirth, emergencyContact) VALUES (?, ?, ?, ?, ?)',
                [patient.personID, patient.insuranceID, patient.contactInfo, patient.dateOfBirth, patient.emergencyContact]
            );
        }
        console.log('Inserted patients.');

        // Insert nurses
        for (const nurse of seedData.nurses) {
            await runQuery(
                'INSERT OR REPLACE INTO Nurse (personID, certification, department, shift) VALUES (?, ?, ?, ?)',
                [nurse.personID, nurse.certification, nurse.department, nurse.shift]
            );
        }
        console.log('Inserted nurses.');

        // Insert admins
        for (const admin of seedData.admins) {
            await runQuery(
                'INSERT OR REPLACE INTO SystemAdministrator (personID, accessLevel, assignedRegion) VALUES (?, ?, ?)',
                [admin.personID, admin.accessLevel, admin.assignedRegion]
            );
        }
        console.log('Inserted administrators.');

        // Insert patient records
        for (const record of seedData.patientRecords) {
            await runQuery(
                'INSERT OR REPLACE INTO PatientRecord (recordID, patientID, dateCreated, status, primaryPhysicianID) VALUES (?, ?, ?, ?, ?)',
                [record.recordID, record.patientID, record.dateCreated, record.status, record.primaryPhysicianID]
            );
        }
        console.log('Inserted patient records.');

        // Insert visits
        for (const visit of seedData.visits) {
            await runQuery(
                'INSERT OR REPLACE INTO Visit (visitID, patientRecordID, visitDate, reason, physicianID, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [visit.visitID, visit.patientRecordID, visit.visitDate, visit.reason, visit.physicianID, visit.notes, visit.status]
            );
        }
        console.log('Inserted visits.');

        // Insert vital signs
        for (const vital of seedData.vitalSigns) {
            await runQuery(
                'INSERT OR REPLACE INTO VitalSign (vitalID, visitID, measureType, value, unit, timestamp, recordedBy) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [vital.vitalID, vital.visitID, vital.measureType, vital.value, vital.unit, vital.timestamp, vital.recordedBy]
            );
        }
        console.log('Inserted vital signs.');

        // Insert prescriptions
        for (const prescription of seedData.prescriptions) {
            await runQuery(
                'INSERT OR REPLACE INTO Prescription (prescriptionID, visitID, medicationName, dosage, frequency, startDate, endDate, instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [prescription.prescriptionID, prescription.visitID, prescription.medicationName, prescription.dosage, prescription.frequency, prescription.startDate, prescription.endDate, prescription.instructions]
            );
        }
        console.log('Inserted prescriptions.');

        // Insert insurance providers
        for (const provider of seedData.insuranceProviders) {
            await runQuery(
                'INSERT OR REPLACE INTO InsuranceProvider (providerID, providerName, contactInfo, apiEndpoint) VALUES (?, ?, ?, ?)',
                [provider.providerID, provider.providerName, provider.contactInfo, provider.apiEndpoint]
            );
        }
        console.log('Inserted insurance providers.');

        // Insert billing summaries
        for (const billing of seedData.billingSummaries) {
            await runQuery(
                'INSERT OR REPLACE INTO BillingSummary (billingID, visitID, patientID, totalCost, billingDate, status, insuranceProviderID) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [billing.billingID, billing.visitID, billing.patientID, billing.totalCost, billing.billingDate, billing.status, billing.insuranceProviderID]
            );
        }
        console.log('Inserted billing summaries.');

    } catch (error) {
        console.error('Error inserting seed data:', error);
        throw error;
    }
}

// Main seeding function
async function seedDatabase() {
    try {
        await clearData();
        await insertSeedData();
        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Database seeding failed:', error);
        process.exit(1);
    } finally {
        db.close();
    }
}

seedDatabase();
