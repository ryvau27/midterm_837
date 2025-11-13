---
description: "Task list template for feature implementation"
---

# Tasks: Unified Patient Manager System

**Input**: Design documents from `/specs/001-unified-patient-manager/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual testing only (unit testing NOT required for academic project)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/` directory
- **Backend**: `backend/src/` directory
- Paths shown assume repository root structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure per plan.md
- [x] T002 Create frontend directory structure per plan.md
- [x] T003 [P] Initialize backend package.json with Node.js dependencies in backend/package.json
- [x] T004 [P] Initialize frontend package.json with React dependencies in frontend/package.json
- [x] T005 Create docker-compose.yml for container orchestration in docker-compose.yml
- [x] T006 Create Dockerfile for backend Node.js application in backend/Dockerfile
- [x] T007 Create Dockerfile and nginx.conf for frontend React application in frontend/Dockerfile and frontend/nginx.conf
- [x] T008 Create README.md with setup instructions in README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create SQLite database schema with all tables in backend/src/database/schema.sql
- [x] T010 Create database initialization script with foreign keys in backend/src/database/init.js
- [x] T011 Create seed data for pre-configured users and sample patients in backend/src/database/seed.js
- [x] T012 Create Express server setup with CORS and JSON middleware in backend/server.js
- [x] T013 Create authentication middleware for role-based access control in backend/src/middleware/auth.js
- [x] T014 Create login logging middleware for basic accountability in backend/src/middleware/audit.js
- [x] T015 Create React app structure with routing setup in frontend/src/App.js
- [x] T016 Create authentication context for session management in frontend/src/context/AuthContext.js
- [x] T017 Create login page component in frontend/src/pages/LoginPage.js
- [x] T018 Create API service functions for HTTP requests in frontend/src/services/api.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Physician Accesses Patient Records (Priority: P1) 🎯 MVP

**Goal**: Physician can login and view complete patient medical records

**Independent Test**: Can be fully tested by physician login, patient search, and record viewing

### Implementation for User Story 1

- [x] T019 [US1] Create Person database model in backend/src/models/Person.js
- [x] T020 [US1] Create Patient database model in backend/src/models/Patient.js
- [x] T021 [US1] Create Physician database model in backend/src/models/Physician.js
- [x] T022 [US1] Create PatientRecord database model in backend/src/models/PatientRecord.js
- [x] T023 [US1] Create Visit database model in backend/src/models/Visit.js
- [x] T024 [US1] Create VitalSign database model in backend/src/models/VitalSign.js
- [x] T025 [US1] Create Prescription database model in backend/src/models/Prescription.js
- [x] T026 [US1] Create AuditLog database model in backend/src/models/AuditLog.js
- [x] T027 [US1] Implement patient search API endpoint in backend/src/routes/patients.js
- [x] T028 [US1] Implement patient record retrieval API endpoint in backend/src/routes/patients.js
- [x] T029 [US1] Create physician dashboard page in frontend/src/pages/PhysicianDashboard.js
- [x] T030 [US1] Create patient search component in frontend/src/components/PatientSearch.js
- [x] T031 [US1] Create patient record display component in frontend/src/components/PatientRecord.js
- [x] T032 [US1] Implement role-based routing for physician dashboard in frontend/src/App.js
- [x] T033 [US1] Connect patient search to API in frontend/src/services/patientService.js

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Nurse Updates Patient Vitals (Priority: P1)

**Goal**: Nurse can login and update patient vital signs with medical validation

**Independent Test**: Can be fully tested by nurse login, patient selection, vital sign entry, validation, and data persistence

### Implementation for User Story 2

- [ ] T036 [US2] Create Nurse database model in backend/src/models/Nurse.js
- [ ] T037 [US2] Implement vital signs validation utility in backend/src/utils/validation.js
- [ ] T038 [US2] Implement patient vitals update API endpoint in backend/src/routes/vitals.js
- [ ] T039 [US2] Create nurse dashboard page in frontend/src/pages/NurseDashboard.js
- [ ] T040 [US2] Create vital signs input form component in frontend/src/components/VitalSignsForm.js
- [ ] T041 [US2] Create patient selector component in frontend/src/components/PatientSelector.js
- [ ] T042 [US2] Implement client-side validation for vital signs in frontend/src/utils/validation.js
- [ ] T043 [US2] Implement role-based routing for nurse dashboard in frontend/src/App.js
- [ ] T044 [US2] Connect vital signs form to API in frontend/src/services/vitalService.js

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Patient Views Own Medical History (Priority: P2)

**Goal**: Patient can login and view their own medical records in read-only format

**Independent Test**: Can be fully tested by patient login, automatic data display, and access control verification

### Implementation for User Story 3

- [ ] T046 [US3] Implement patient self-service API endpoint in backend/src/routes/patients.js
- [ ] T047 [US3] Create patient dashboard page in frontend/src/pages/PatientDashboard.js
- [ ] T048 [US3] Create read-only patient record component in frontend/src/components/PatientRecordView.js
- [ ] T049 [US3] Implement role-based routing for patient dashboard in frontend/src/App.js
- [ ] T050 [US3] Add access control to prevent patients from viewing other patient data in backend/src/middleware/auth.js
- [ ] T051 [US3] Connect patient dashboard to self-service API in frontend/src/services/patientService.js

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Physician Generates Billing Summary (Priority: P2)

**Goal**: Physician can generate billing reports from completed visits with cost calculation

**Independent Test**: Can be fully tested by physician billing selection, cost calculation, and mock insurance submission

### Implementation for User Story 4

- [ ] T052 [US4] Create BillingSummary database model in backend/src/models/BillingSummary.js
- [ ] T053 [US4] Create InsuranceProvider database model in backend/src/models/InsuranceProvider.js
- [ ] T054 [US4] Implement billing calculation service in backend/src/services/billingService.js
- [ ] T055 [US4] Implement unbilled visits API endpoint in backend/src/routes/billing.js
- [ ] T056 [US4] Implement billing generation API endpoint in backend/src/routes/billing.js
- [ ] T057 [US4] Implement mock insurance provider API in backend/src/routes/mockInsurance.js
- [ ] T058 [US4] Create billing generator component in frontend/src/components/BillingGenerator.js
- [ ] T059 [US4] Add billing features to physician dashboard in frontend/src/pages/PhysicianDashboard.js
- [ ] T060 [US4] Connect billing components to API in frontend/src/services/billingService.js

**Checkpoint**: At this point, User Stories 1, 2, 3 AND 4 should all work independently

---

## Phase 7: User Story 5 - Administrator Reviews Audit Logs (Priority: P3)

**Goal**: System administrator can review login audit logs for basic accountability

**Independent Test**: Can be fully tested by admin login, log filtering, display, and read-only verification

### Implementation for User Story 5

- [ ] T062 [US5] Create SystemAdministrator database model in backend/src/models/SystemAdministrator.js
- [ ] T063 [US5] Implement audit log filtering API endpoint in backend/src/routes/audit.js
- [ ] T064 [US5] Create admin dashboard page in frontend/src/pages/AdminDashboard.js
- [ ] T065 [US5] Create audit log viewer component in frontend/src/components/AuditLogViewer.js
- [ ] T066 [US5] Create audit log filter component in frontend/src/components/AuditLogFilters.js
- [ ] T067 [US5] Implement role-based routing for admin dashboard in frontend/src/App.js
- [ ] T068 [US5] Connect audit log viewer to API in frontend/src/services/auditService.js
- [ ] T069 [US5] Add read-only protection to audit log endpoints in backend/src/routes/audit.js

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T070 [P] Add error handling and user-friendly messages across all frontend components
- [ ] T071 [P] Implement loading indicators for async operations in frontend components
- [ ] T072 [P] Add responsive design and professional styling in frontend/src/App.css
- [ ] T073 [P] Implement logout functionality across all dashboards in frontend components
- [ ] T074 [P] Add input sanitization and security validation in backend/src/middleware/validation.js
- [ ] T075 [P] Optimize database queries and add indexes in backend/src/database/schema.sql
- [ ] T076 [P] Add comprehensive seed data for testing all scenarios in backend/src/database/seed.js
- [ ] T077 Update quickstart documentation with final testing instructions in README.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Models before services
- Services before routes/endpoints
- Backend before frontend components
- Core functionality before UI polish
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Database models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all models for User Story 1 together:
Task: "Create Person database model in backend/src/models/Person.js"
Task: "Create Patient database model in backend/src/models/Patient.js"
Task: "Create Physician database model in backend/src/models/Physician.js"
Task: "Create PatientRecord database model in backend/src/models/PatientRecord.js"
Task: "Create Visit database model in backend/src/models/Visit.js"
Task: "Create VitalSign database model in backend/src/models/VitalSign.js"
Task: "Create Prescription database model in backend/src/models/Prescription.js"
Task: "Create AuditLog database model in backend/src/models/AuditLog.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Physician access)
   - Developer B: User Story 2 (Nurse updates)
   - Developer C: User Story 3 (Patient self-service)
   - Developer D: User Story 4 (Billing generation)
   - Developer E: User Story 5 (Audit logs)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Backend database models and API endpoints should be completed before frontend components
- Authentication and audit logging are cross-cutting concerns affecting all user stories
- All tasks include specific file paths for immediate execution
- Manual testing focus - no unit test tasks included per academic requirements
- Docker containerization enables easy testing and deployment throughout development
