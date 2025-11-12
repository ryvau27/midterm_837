# Data Model: Unified Patient Manager System

**Date**: 2025-11-12
**Feature**: specs/001-unified-patient-manager/spec.md

## Overview

The UPM system uses a relational SQLite database with foreign key relationships to maintain data integrity. All entities include audit timestamps and follow the domain model defined in the specification.

## Core Entities

### Person (Base Entity)
**Purpose**: Base entity for all user types in the system

**Fields**:
- `personID` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `name` (TEXT, NOT NULL)
- `role` (TEXT, NOT NULL) - Values: "physician", "patient", "nurse", "admin"
- `createdAt` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `updatedAt` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

**Relationships**: Extended by Patient, Physician, Nurse, SystemAdministrator

**Validation Rules**:
- `role` must be one of the four allowed values
- `name` cannot be empty

### Patient
**Purpose**: Represents patients in the healthcare system

**Fields**:
- `personID` (INTEGER, PRIMARY KEY, FOREIGN KEY → Person.personID)
- `insuranceID` (TEXT, UNIQUE)
- `contactInfo` (TEXT) - JSON string with phone, email, address
- `dateOfBirth` (DATE)
- `emergencyContact` (TEXT) - JSON string

**Relationships**:
- Has many PatientRecords (1:N)
- Referenced by AuditLog entries

**Validation Rules**:
- `insuranceID` must be unique if provided
- `contactInfo` must be valid JSON format

### Physician
**Purpose**: Represents healthcare providers

**Fields**:
- `personID` (INTEGER, PRIMARY KEY, FOREIGN KEY → Person.personID)
- `licenseNumber` (TEXT, UNIQUE, NOT NULL)
- `specialty` (TEXT)
- `department` (TEXT)

**Relationships**:
- Referenced by Visits (conducting physician)
- Referenced by AuditLog entries (as actor)

**Validation Rules**:
- `licenseNumber` must be unique
- Specialty should be from standard medical specialties list

### Nurse
**Purpose**: Represents nursing staff

**Fields**:
- `personID` (INTEGER, PRIMARY KEY, FOREIGN KEY → Person.personID)
- `certification` (TEXT)
- `department` (TEXT)
- `shift` (TEXT) - Values: "day", "night", "evening"

**Relationships**:
- Referenced by VitalSigns (recording nurse)
- Referenced by AuditLog entries (as actor)

**Validation Rules**:
- Department must match hospital structure
- Shift must be one of allowed values

### SystemAdministrator
**Purpose**: Represents system administrators

**Fields**:
- `personID` (INTEGER, PRIMARY KEY, FOREIGN KEY → Person.personID)
- `accessLevel` (TEXT) - Values: "full", "readonly", "audit_only"
- `assignedRegion` (TEXT)
- `lastLogin` (DATETIME)

**Relationships**:
- Can view all AuditLog entries
- Referenced by AuditLog entries (as actor)

**Validation Rules**:
- `accessLevel` must be one of allowed values

## Medical Data Entities

### PatientRecord
**Purpose**: Contains all medical information for a patient

**Fields**:
- `recordID` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `patientID` (INTEGER, NOT NULL, FOREIGN KEY → Patient.personID)
- `dateCreated` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `status` (TEXT, DEFAULT "active") - Values: "active", "archived", "transferred"
- `primaryPhysicianID` (INTEGER, FOREIGN KEY → Physician.personID)

**Relationships**:
- Belongs to one Patient (N:1)
- Has many Visits (1:N)

**Validation Rules**:
- `status` must be one of allowed values
- Patient must exist before creating record

### Visit
**Purpose**: Represents patient visits to healthcare facility

**Fields**:
- `visitID` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `patientRecordID` (INTEGER, NOT NULL, FOREIGN KEY → PatientRecord.recordID)
- `visitDate` (DATETIME, NOT NULL)
- `reason` (TEXT, NOT NULL)
- `physicianID` (INTEGER, FOREIGN KEY → Physician.personID)
- `notes` (TEXT)
- `status` (TEXT, DEFAULT "completed") - Values: "scheduled", "in_progress", "completed", "cancelled"

**Relationships**:
- Belongs to one PatientRecord (N:1)
- Has many VitalSigns (1:N)
- Has many Prescriptions (1:N)
- Generates one BillingSummary (1:1)

**Validation Rules**:
- `visitDate` cannot be in the future
- `status` must be one of allowed values
- Physician must exist if assigned

### VitalSign
**Purpose**: Records patient vital measurements

**Fields**:
- `vitalID` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `visitID` (INTEGER, NOT NULL, FOREIGN KEY → Visit.visitID)
- `measureType` (TEXT, NOT NULL) - Values: "temperature", "blood_pressure", "heart_rate", "respiratory_rate", "weight", "height"
- `value` (REAL, NOT NULL)
- `unit` (TEXT, NOT NULL) - Values: "°F", "mmHg", "bpm", "breaths/min", "lbs", "kg", "inches", "cm"
- `timestamp` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `recordedBy` (INTEGER, FOREIGN KEY → Nurse.personID or Physician.personID)

**Relationships**:
- Belongs to one Visit (N:1)

**Validation Rules**:
- Temperature: 95.0-105.0 °F
- Blood Pressure Systolic: 80-200 mmHg, Diastolic: 50-120 mmHg
- Heart Rate: 40-200 bpm
- Respiratory Rate: 8-40 breaths/min
- Weight: 50-500 lbs or 20-225 kg
- Height: 24-84 inches or 60-215 cm
- Unit must match measureType

### Prescription
**Purpose**: Records medications prescribed during visits

**Fields**:
- `prescriptionID` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `visitID` (INTEGER, NOT NULL, FOREIGN KEY → Visit.visitID)
- `medicationName` (TEXT, NOT NULL)
- `dosage` (TEXT, NOT NULL) - e.g., "500mg", "10mL"
- `frequency` (TEXT, NOT NULL) - e.g., "twice daily", "every 8 hours"
- `startDate` (DATE, NOT NULL)
- `endDate` (DATE)
- `instructions` (TEXT)

**Relationships**:
- Belongs to one Visit (N:1)

**Validation Rules**:
- `startDate` cannot be in the past
- `endDate` must be after `startDate` if provided
- Medication name cannot be empty

## Administrative Entities

### BillingSummary
**Purpose**: Contains billing information for visits

**Fields**:
- `billingID` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `visitID` (INTEGER, UNIQUE, FOREIGN KEY → Visit.visitID)
- `patientID` (INTEGER, NOT NULL, FOREIGN KEY → Patient.personID)
- `totalCost` (REAL, NOT NULL)
- `billingDate` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `status` (TEXT, DEFAULT "pending") - Values: "pending", "submitted", "paid", "denied"
- `insuranceProviderID` (INTEGER, FOREIGN KEY → InsuranceProvider.providerID)

**Relationships**:
- Generated from one Visit (1:1)
- Sent to one InsuranceProvider (N:1)

**Validation Rules**:
- `totalCost` must be positive
- `status` must be one of allowed values
- One billing per visit maximum

### InsuranceProvider
**Purpose**: Represents external insurance companies

**Fields**:
- `providerID` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `providerName` (TEXT, NOT NULL, UNIQUE)
- `contactInfo` (TEXT) - JSON string with contact details
- `apiEndpoint` (TEXT) - Mock endpoint URL

**Relationships**:
- Receives many BillingSummaries (1:N)

**Validation Rules**:
- `providerName` must be unique
- `contactInfo` must be valid JSON if provided

### AuditLog
**Purpose**: Tracks all access to patient data for HIPAA compliance

**Fields**:
- `logID` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `timestamp` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `userID` (INTEGER, NOT NULL, FOREIGN KEY → Person.personID)
- `userRole` (TEXT, NOT NULL)
- `actionType` (TEXT, NOT NULL) - Values: "LOGIN", "LOGIN_FAILED", "LOGOUT", "VIEW_RECORD", "UPDATE_VITALS", "GENERATE_BILLING", "VIEW_LOGS"
- `targetPatientID` (INTEGER, FOREIGN KEY → Patient.personID) - Nullable
- `details` (TEXT) - Additional context as JSON string
- `ipAddress` (TEXT) - Client IP for logging

**Relationships**:
- Logs actions by one Person (N:1)
- May reference a target Patient (N:1)

**Validation Rules**:
- `actionType` must be one of allowed values
- `userRole` must match the user's actual role
- All fields are read-only after creation

## Database Schema

### Indexes (for Performance)
- PatientRecord.patientID
- Visit.patientRecordID, Visit.visitDate
- VitalSign.visitID
- Prescription.visitID
- BillingSummary.visitID, BillingSummary.status
- AuditLog.timestamp, AuditLog.userID, AuditLog.actionType

### Constraints
- All foreign keys have CASCADE delete where appropriate
- Unique constraints on insurance IDs, license numbers
- Check constraints on enumerated fields
- NOT NULL constraints on required fields

### Seed Data Requirements
- 4 pre-configured users (1 of each role)
- 3-5 patients with complete medical histories
- Multiple visits per patient (2-4 visits each)
- Vital signs and prescriptions for visits
- Sample billing summaries and audit logs

## Data Flow

1. **Authentication**: User credentials validated against Person table
2. **Patient Access**: Physician/Patient queries through PatientRecord → Visit → VitalSign/Prescription relationships
3. **Updates**: Nurse creates new VitalSign records linked to existing Visits
4. **Billing**: Physician creates BillingSummary from completed Visit
5. **Audit**: All operations automatically create AuditLog entries
6. **Admin Review**: Administrator queries AuditLog with filters

This relational model ensures data integrity while supporting all required use cases with proper audit trails.
