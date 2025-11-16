# API Contracts: Unified Patient Manager System

**Date**: 2025-11-12
**Feature**: specs/001-unified-patient-manager/spec.md

## Overview

The UPM backend provides a RESTful API with role-based access control. All endpoints require authentication via session-based approach (user stored in localStorage on frontend). The API uses standard HTTP methods and JSON request/response formats.

## Authentication

### Session Management
- **Frontend Storage**: User object stored in localStorage as JSON
- **Backend Validation**: All protected routes validate user role from session
- **No Tokens**: Simple session validation without JWT or external auth services

### Pre-configured Users
```json
[
  {"username": "dr.smith", "password": "physician123", "role": "physician"},
  {"username": "john.doe", "password": "patient123", "role": "patient"},
  {"username": "nurse.jane", "password": "nurse123", "role": "nurse"},
  {"username": "admin", "password": "admin123", "role": "admin"}
]
```

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "details": "Optional additional details"
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "fieldName": "Error message for this field"
  }
}
```

## Authentication Endpoints

### POST /api/auth/login
**Purpose**: Authenticate user and establish session

**Required Role**: None (public endpoint)

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "personID": 1,
      "name": "Dr. Smith",
      "role": "physician",
      "username": "dr.smith"
    }
  }
}
```

**Error Responses**:
- 401: Invalid credentials
- 400: Missing username/password

**Implementation Notes**:
- Compares plain text password (no encryption per requirements)
- Returns user object for frontend storage
- Logs login attempts to audit log

### POST /api/auth/logout
**Purpose**: Clear user session

**Required Role**: Any authenticated user

**Request Body**: None

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Patient Management Endpoints

### GET /api/patients/search
**Purpose**: Search patients by name or ID (Physician only)

**Required Role**: physician

**Query Parameters**:
- `query` (string): Search term for patient name or ID

**Success Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "personID": 1,
      "name": "John Doe",
      "insuranceID": "INS123456",
      "dateOfBirth": "1980-01-15"
    }
  ]
}
```

### GET /api/patients/:id
**Purpose**: Get complete patient record (Physician only)

**Required Role**: physician

**URL Parameters**:
- `id` (integer): Patient personID

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "patient": {
      "personID": 1,
      "name": "John Doe",
      "insuranceID": "INS123456",
      "contactInfo": "{\"phone\":\"555-0123\",\"email\":\"john@example.com\"}",
      "dateOfBirth": "1980-01-15"
    },
    "records": [
      {
        "recordID": 1,
        "dateCreated": "2025-01-15T10:00:00Z",
        "status": "active",
        "visits": [
          {
            "visitID": 1,
            "visitDate": "2025-01-15T10:00:00Z",
            "reason": "Annual checkup",
            "physicianName": "Dr. Smith",
            "vitalSigns": [
              {
                "measureType": "blood_pressure",
                "value": "120/80",
                "unit": "mmHg",
                "timestamp": "2025-01-15T10:15:00Z"
              }
            ],
            "prescriptions": [
              {
                "medicationName": "Lisinopril",
                "dosage": "10mg",
                "frequency": "once daily",
                "startDate": "2025-01-15"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**Error Responses**:
- 404: Patient not found
- 403: Access denied

### GET /api/patients/me
**Purpose**: Get current patient's own record (Patient only)

**Required Role**: patient

**Success Response (200)**: Same format as GET /api/patients/:id but only returns current patient's data

## Vital Signs Management

### POST /api/patients/:patientId/vitals
**Purpose**: Add vital signs for a patient (Nurse only)

**Required Role**: nurse

**URL Parameters**:
- `patientId` (integer): Patient personID

**Request Body**:
```json
{
  "visitId": 1,
  "vitalSigns": [
    {
      "measureType": "temperature",
      "value": 98.6,
      "unit": "°F"
    },
    {
      "measureType": "blood_pressure",
      "value": "120/80",
      "unit": "mmHg"
    }
  ]
}
```

**Validation Rules**:
- Temperature: 95.0-105.0 °F
- Blood Pressure: Systolic 80-200, Diastolic 50-120
- Heart Rate: 40-200 bpm
- Respiratory Rate: 8-40 breaths/min

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Vital signs recorded successfully",
  "data": {
    "recordedCount": 2
  }
}
```

**Error Responses**:
- 400: Validation failed with field-specific errors
- 404: Patient or visit not found

## Billing Endpoints

### GET /api/visits/unbilled
**Purpose**: Get list of unbilled visits (Physician only)

**Required Role**: physician

**Success Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "visitID": 1,
      "patientName": "John Doe",
      "visitDate": "2025-01-15T10:00:00Z",
      "reason": "Annual checkup",
      "estimatedCost": 150.00
    }
  ]
}
```

### POST /api/billing/generate
**Purpose**: Generate billing summary for selected visits (Physician only)

**Required Role**: physician

**Request Body**:
```json
{
  "visitIds": [1, 2, 3]
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Billing summary generated and submitted",
  "data": {
    "billingSummaries": [
      {
        "billingID": 1,
        "visitID": 1,
        "totalCost": 150.00,
        "billingDate": "2025-11-12T14:30:00Z",
        "status": "submitted"
      }
    ]
  }
}
```

## Audit Log Endpoints

### GET /api/audit/logs
**Purpose**: Retrieve login audit logs with filtering (Admin only)

**Required Role**: admin

**Query Parameters**:
- `startDate` (ISO date string): Filter logs after this date
- `endDate` (ISO date string): Filter logs before this date
- `userType` (string): Filter by role ("physician", "nurse", "patient", "admin", "all")
- `actionType` (string): Filter by action ("LOGIN", "LOGIN_FAILED", "all")

**Success Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "logID": 1,
      "timestamp": "2025-11-12T14:30:00Z",
      "userID": 1,
      "userRole": "physician",
      "actionType": "LOGIN",
      "ipAddress": "192.168.1.100"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150
  }
}
```

## Mock External System Endpoints

### POST /api/mock/insurance/submit
**Purpose**: Simulate insurance provider billing submission

**Required Role**: physician (called internally by billing generation)

**Request Body**:
```json
{
  "billingSummary": {
    "billingID": 1,
    "patientID": 2,
    "totalCost": 150.00,
    "billingDate": "2025-11-12T14:30:00Z"
  }
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "submissionId": "MOCK-12345",
    "status": "accepted",
    "estimatedProcessingDays": 3
  }
}
```

## Middleware Specifications

### Authentication Middleware
- Checks for user in localStorage (sent as JSON in request header)
- Validates user role against endpoint requirements
- Logs authentication failures to audit log
- Returns 401 for missing/invalid authentication

### Role-Based Access Control Middleware
- Maps endpoints to required roles:
  - `/api/patients/search`: physician
  - `/api/patients/:id`: physician
  - `/api/patients/me`: patient
  - `/api/patients/*/vitals`: nurse
  - `/api/visits/unbilled`: physician
  - `/api/billing/generate`: physician
  - `/api/audit/*`: admin
- Returns 403 for insufficient permissions

### Login Audit Logging Middleware
- Automatically logs user login attempts (successful and failed)
- Captures: timestamp, userID, userRole, actionType, ipAddress
- Does not interfere with response times
- Logs to database asynchronously

## Error Handling

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

### Error Response Format
All errors follow the standard error response format with appropriate HTTP status codes and descriptive messages.

## Rate Limiting
- No rate limiting implemented (academic demonstration)
- All endpoints available for testing purposes

## API Versioning
- No versioning implemented (single version API)
- All endpoints prefixed with `/api/`

This contract defines a complete REST API that supports all five use cases with proper security, validation, and audit logging as required by HIPAA compliance standards for academic demonstration.
