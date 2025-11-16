# Implementation Plan: Unified Patient Manager System

**Branch**: `001-unified-patient-manager` | **Date**: 2025-11-12 | **Spec**: specs/001-unified-patient-manager/spec.md
**Input**: Feature specification from `/specs/001-unified-patient-manager/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

The Unified Patient Manager (UPM) is a healthcare application providing centralized access to patient medical records with HIPAA-compliant security measures. The system implements role-based access control for physicians, patients, nurses, and system administrators, featuring authentication, patient record management, vital sign updates, billing generation, and audit logging.

**Technical Approach**: Full-stack JavaScript application with React frontend and Node.js/Express backend, using SQLite for data persistence and Docker containerization. Simple username/password authentication with localStorage session management, RESTful API design, and comprehensive audit logging for HIPAA compliance.

## Technical Context

**Language/Version**: JavaScript (ES6+) - NO TypeScript allowed
**Primary Dependencies**:
  - Frontend: React, React Router, Axios, simple CSS
  - Backend: Node.js, Express, SQLite3, cors, body-parser
  - Containerization: Docker, Docker Compose
**Storage**: SQLite database with relational schema
**Testing**: Manual testing only (unit testing NOT required for academic project)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Functional operation of all user interactions, basic audit logging for logins
**Constraints**:
  - JavaScript only (no TypeScript)
  - Simple authentication (username/password comparison, no encryption frameworks)
  - Mock data and simplified external systems
  - Academic demonstration appropriate (not production-grade security)
  - Docker containerization mandatory
**Scale/Scope**: 4 pre-configured users, 3-5 patients with complete medical histories, 5 core use cases, HIPAA-compliant audit logging

## Constitution Check

*GATE: Must pass before Phase 0 research. ✅ PASSED after Phase 1 design - all constitution principles satisfied.*

### Simplified School Project Constitution Compliance Gates

**GATE 1 - Simplified School Project Approach**
- [x] Is this treated as an academic demonstration project? (Focus on core functionality without complex compliance)
- [x] Are simplified approaches used for authentication and data handling? (Plain text passwords, mock data)
- [x] No complex security frameworks required? (Simple role-based access without extensive compliance)

**GATE 2 - Role-Based Access Control**
- [x] Does the feature respect user roles (Physician, Patient, Nurse, System Administrator)? (4 pre-configured roles with specific permissions)
- [x] Are role permissions properly enforced on API endpoints? (Backend middleware validates roles for each endpoint)
- [x] Does authentication redirect to role-specific dashboards? (Frontend routes users to role-appropriate dashboards)

**GATE 3 - Data Integrity and Validation**
- [x] Are medical data inputs validated for realistic ranges? (Vital signs validated against medical standards)
- [x] Do vital signs conform to medical standards? (Temperature 95-105°F, BP 80-200/50-120, etc.)
- [x] Is referential integrity maintained? (SQLite foreign keys maintain relationships between entities)

**GATE 4 - Simplified Audit Logging**
- [x] Are user logins logged with timestamps? (Login attempts recorded for basic accountability)
- [x] Are audit logs read-only for administrators? (Admin can review login logs)
- [x] No extensive audit trail required? (Only login events logged, not all data access)

**GATE 5 - Technical Standards**
- [x] Is JavaScript used exclusively (NO TypeScript)? (Both frontend and backend use JavaScript only)
- [x] Are Docker and Docker Compose utilized? (Mandatory containerization for deployment)
- [x] Does the architecture follow RESTful API design? (Express backend provides REST endpoints)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # Database models and schemas
│   ├── routes/          # Express route handlers
│   ├── middleware/      # Authentication and validation middleware
│   ├── services/        # Business logic services
│   ├── database/        # SQLite setup and seed data
│   └── utils/           # Helper functions
├── package.json
├── server.js            # Express app entry point
└── Dockerfile

frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/      # Reusable React components
│   ├── pages/           # Dashboard pages for each role
│   ├── services/        # API service functions
│   ├── context/         # React context for authentication
│   ├── utils/           # Helper functions
│   └── App.js           # Main React app component
├── package.json
├── Dockerfile
└── nginx.conf           # Nginx config for serving React app

docker-compose.yml       # Container orchestration
README.md               # Setup and usage instructions
```

**Structure Decision**: Web application architecture with separate frontend (React) and backend (Node.js/Express) containers. Frontend serves static files via Nginx, backend provides REST API. SQLite database file mounted as volume. No testing directories needed as unit testing is not required for this academic project.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
