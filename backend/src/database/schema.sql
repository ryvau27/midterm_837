-- Unified Patient Manager Database Schema
-- SQLite database for healthcare system

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Person table (base for all users)
CREATE TABLE IF NOT EXISTS Person (
    personID INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('physician', 'patient', 'nurse', 'admin')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Patient table
CREATE TABLE IF NOT EXISTS Patient (
    personID INTEGER PRIMARY KEY,
    insuranceID TEXT UNIQUE,
    contactInfo TEXT, -- JSON string
    dateOfBirth DATE,
    emergencyContact TEXT, -- JSON string
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (personID) REFERENCES Person(personID) ON DELETE CASCADE
);

-- Physician table
CREATE TABLE IF NOT EXISTS Physician (
    personID INTEGER PRIMARY KEY,
    licenseNumber TEXT UNIQUE NOT NULL,
    specialty TEXT,
    department TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (personID) REFERENCES Person(personID) ON DELETE CASCADE
);

-- Nurse table
CREATE TABLE IF NOT EXISTS Nurse (
    personID INTEGER PRIMARY KEY,
    certification TEXT,
    department TEXT,
    shift TEXT CHECK (shift IN ('day', 'night', 'evening')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (personID) REFERENCES Person(personID) ON DELETE CASCADE
);

-- SystemAdministrator table
CREATE TABLE IF NOT EXISTS SystemAdministrator (
    personID INTEGER PRIMARY KEY,
    accessLevel TEXT NOT NULL CHECK (accessLevel IN ('full', 'readonly', 'audit_only')) DEFAULT 'readonly',
    assignedRegion TEXT,
    lastLogin DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (personID) REFERENCES Person(personID) ON DELETE CASCADE
);

-- PatientRecord table
CREATE TABLE IF NOT EXISTS PatientRecord (
    recordID INTEGER PRIMARY KEY AUTOINCREMENT,
    patientID INTEGER NOT NULL,
    dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'transferred')),
    primaryPhysicianID INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientID) REFERENCES Patient(personID) ON DELETE CASCADE,
    FOREIGN KEY (primaryPhysicianID) REFERENCES Physician(personID)
);

-- Visit table
CREATE TABLE IF NOT EXISTS Visit (
    visitID INTEGER PRIMARY KEY AUTOINCREMENT,
    patientRecordID INTEGER NOT NULL,
    visitDate DATETIME NOT NULL,
    reason TEXT NOT NULL,
    physicianID INTEGER,
    notes TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientRecordID) REFERENCES PatientRecord(recordID) ON DELETE CASCADE,
    FOREIGN KEY (physicianID) REFERENCES Physician(personID)
);

-- VitalSign table
CREATE TABLE IF NOT EXISTS VitalSign (
    vitalID INTEGER PRIMARY KEY AUTOINCREMENT,
    visitID INTEGER NOT NULL,
    measureType TEXT NOT NULL CHECK (measureType IN ('temperature', 'blood_pressure', 'heart_rate', 'respiratory_rate', 'weight', 'height')),
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    recordedBy INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visitID) REFERENCES Visit(visitID) ON DELETE CASCADE,
    FOREIGN KEY (recordedBy) REFERENCES Person(personID)
);

-- Prescription table
CREATE TABLE IF NOT EXISTS Prescription (
    prescriptionID INTEGER PRIMARY KEY AUTOINCREMENT,
    visitID INTEGER NOT NULL,
    medicationName TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE,
    instructions TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visitID) REFERENCES Visit(visitID) ON DELETE CASCADE
);

-- BillingSummary table
CREATE TABLE IF NOT EXISTS BillingSummary (
    billingID INTEGER PRIMARY KEY AUTOINCREMENT,
    visitID INTEGER UNIQUE NOT NULL,
    patientID INTEGER NOT NULL,
    totalCost REAL NOT NULL,
    billingDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'paid', 'denied')),
    insuranceProviderID INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visitID) REFERENCES Visit(visitID) ON DELETE CASCADE,
    FOREIGN KEY (patientID) REFERENCES Patient(personID),
    FOREIGN KEY (insuranceProviderID) REFERENCES InsuranceProvider(providerID)
);

-- InsuranceProvider table
CREATE TABLE IF NOT EXISTS InsuranceProvider (
    providerID INTEGER PRIMARY KEY AUTOINCREMENT,
    providerName TEXT NOT NULL UNIQUE,
    contactInfo TEXT, -- JSON string
    apiEndpoint TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AuditLog table
CREATE TABLE IF NOT EXISTS AuditLog (
    logID INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    userID INTEGER NOT NULL,
    userRole TEXT NOT NULL,
    actionType TEXT NOT NULL CHECK (actionType IN ('LOGIN', 'LOGIN_FAILED')),
    ipAddress TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Person(personID)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_record_patient ON PatientRecord(patientID);
CREATE INDEX IF NOT EXISTS idx_visit_patient_record ON Visit(patientRecordID);
CREATE INDEX IF NOT EXISTS idx_visit_date ON Visit(visitDate);
CREATE INDEX IF NOT EXISTS idx_vital_sign_visit ON VitalSign(visitID);
CREATE INDEX IF NOT EXISTS idx_prescription_visit ON Prescription(visitID);
CREATE INDEX IF NOT EXISTS idx_billing_visit ON BillingSummary(visitID);
CREATE INDEX IF NOT EXISTS idx_billing_status ON BillingSummary(status);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON AuditLog(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_user ON AuditLog(userID);
CREATE INDEX IF NOT EXISTS idx_audit_action ON AuditLog(actionType);
