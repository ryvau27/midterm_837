<!--
SYNC IMPACT REPORT
Version change: none → 1.0.0
Modified principles: none (initial constitution)
Added sections: Core Principles (5 principles), Technical Standards and Architecture, Development and Implementation Guidelines, Governance
Templates requiring updates: ✅ plan-template.md (constitution check gates updated), spec-template.md (no changes needed), tasks-template.md (no changes needed)
Follow-up TODOs: none
-->

# Unified Patient Manager (UPM) Constitution

## Core Principles



### II. Role-Based Access Control
User roles (Physician, Patient, Nurse, System Administrator) determine access permissions and dashboard routing. Each role has pre-configured credentials for simple username/password authentication. Role-based access must be enforced on both frontend routes and backend API endpoints. Authentication simulates login by redirecting to role-specific dashboards without external services or session management.

### III. Data Integrity and Validation
All medical data inputs must be validated for realistic value ranges and required fields. Vital signs must conform to medical standards (e.g., blood pressure ranges, temperature limits). Patient records must maintain referential integrity. Input validation occurs before storage with clear error messaging for invalid data.

### IV. Audit Logging and Accountability
Every access to patient records must be logged with timestamp, actor ID, and action performed. Audit logs are immutable and read-only. System administrators can review logs for compliance monitoring. All record updates and views generate audit entries. Logs support HIPAA compliance requirements for academic demonstration.

### V. Simplified Authentication and Mock Data
No complex authentication frameworks, OAuth, or external identity providers. Use simple username/password validation against pre-configured test accounts. Mock data is required and encouraged for patients, medical records, visits, and external systems. Pre-configured credentials enable role-based testing without production authentication complexity.

## Technical Standards and Architecture

### Technology Stack (MANDATORY)
- **Frontend**: React with JavaScript (NO TypeScript)
- **Backend**: Node.js with Express and JavaScript (NO TypeScript)
- **Database**: SQLite for data persistence
- **Containerization**: Docker and Docker Compose required
- **Authentication**: Simple in-application login (no external services)

### Architecture Patterns
- **Separation of Concerns**: Clear separation between frontend, backend, and data layers
- **RESTful API Design**: Backend exposes REST endpoints for CRUD operations
- **Mock External Systems**: Insurance providers and EHR databases simulated as functions or mock endpoints
- **In-Memory/State Management**: Simple state management without complex frameworks

### Data Storage Requirements
- **SQLite Database**: Primary data store for patient records, users, and audit logs
- **Schema Design**: Relational design with proper foreign keys and constraints
- **Seed Data**: Realistic healthcare scenarios with pre-populated test data
- **Data Relationships**: Patient → Records → Visits → Vital Signs/Prescriptions

## Development and Implementation Guidelines

### Code Quality Standards
- **JavaScript Only**: NO TypeScript usage throughout the application
- **Modular Design**: Separate concerns into distinct files and functions
- **Error Handling**: Proper error responses and user feedback
- **Documentation**: Inline comments for complex logic and API endpoints

### Security Implementation (Academic Level)
- **Role Validation**: Backend middleware validates user roles for each endpoint
- **Input Sanitization**: All inputs validated and sanitized before processing
- **Audit Trail**: Automatic logging of all data access operations
- **No External Dependencies**: Authentication handled internally without external services

### Testing and Validation (OPTIONAL)
- Unit testing is NOT required for this academic project
- Manual testing of role-based access and core workflows is expected
- Mock data validation ensures realistic healthcare scenarios
- User acceptance testing focuses on role-specific functionality

### Deployment and Environment
- **Docker Compose**: Required for containerized development environment
- **Environment Configuration**: Simple configuration for different environments
- **Seed Data**: Automatic population of test data on startup
- **Development Focus**: Academic demonstration over production deployment

## Governance

This constitution establishes the architectural principles, design patterns, security standards, data handling policies, and technical guidelines for the Unified Patient Manager healthcare system demonstration. All implementation decisions must align with these principles to ensure HIPAA compliance, role-based access control, and proper separation of concerns.

**Amendment Process**: Constitution amendments require clear justification and must maintain alignment with healthcare system requirements and academic project constraints. Changes must be documented with rationale.

**Compliance Review**: All features must demonstrate compliance with role-based access control and HIPAA-compliant audit logging. Security measures appropriate for academic demonstration must be verifiable.

**Version Control**: Constitution versioning follows semantic versioning. Major changes require complete review, minor changes add new guidance, patch changes clarify existing principles.

**Version**: 1.0.0 | **Ratified**: 2025-11-12 | **Last Amended**: 2025-11-12
