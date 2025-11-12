# Quick Start Guide: Unified Patient Manager System

**Date**: 2025-11-12
**Feature**: specs/001-unified-patient-manager/spec.md

## Prerequisites

- Docker and Docker Compose installed
- At least 2GB free RAM
- Ports 3000 and 5000 available on localhost

## Project Setup

1. **Clone and navigate to project**:
   ```bash
   git clone <repository-url>
   cd unified-patient-manager
   git checkout 001-unified-patient-manager
   ```

2. **Start the application**:
   ```bash
   docker-compose up --build
   ```

3. **Wait for containers to start**:
   - Frontend will be available at http://localhost:3000
   - Backend API will be available at http://localhost:5000
   - Database will be initialized with seed data

## Pre-configured Test Users

| Role | Username | Password | Dashboard URL |
|------|----------|----------|---------------|
| Physician | dr.smith | physician123 | /physician-dashboard |
| Patient | john.doe | patient123 | /patient-dashboard |
| Nurse | nurse.jane | nurse123 | /nurse-dashboard |
| System Administrator | admin | admin123 | /admin-dashboard |

## Testing the Use Cases

### Use Case 1: User Authentication

1. Open http://localhost:3000 in your browser
2. Click "Login" or navigate to the login page
3. Enter credentials from the table above
4. Verify you're redirected to the appropriate dashboard based on your role

**Expected Results**:
- Physician: Access to patient search and billing features
- Patient: View personal medical records only
- Nurse: Access to vital signs recording
- Admin: Access to audit log review

### Use Case 2: Physician Accesses Patient Records

1. Login as physician (dr.smith/physician123)
2. Navigate to "View Patient Records" or "Search Patients"
3. Enter patient name "John Doe" or patient ID "1"
4. Click "Search"

**Expected Results**:
- Complete patient record displays with demographics, visit history, vital signs, and prescriptions
- Audit log entry created (can be verified by admin user)

### Use Case 3: Nurse Updates Patient Vitals

1. Login as nurse (nurse.jane/nurse123)
2. Navigate to "Update Patient Record"
3. Select "John Doe" from patient list
4. Enter valid vital signs:
   - Temperature: 98.6 °F
   - Blood Pressure: 120/80 mmHg
   - Heart Rate: 72 bpm
   - Respiratory Rate: 16 breaths/min
5. Add treatment notes: "Patient reports feeling well"
6. Click "Submit"

**Expected Results**:
- Success message displays
- Data saved to database with timestamp
- Audit log entry created

### Use Case 4: Physician Generates Billing

1. Login as physician (dr.smith/physician123)
2. Navigate to "Generate Billing Summary"
3. Select one or more unbilled visits from the list
4. Click "Generate Billing"

**Expected Results**:
- Billing summary created with calculated costs
- Mock insurance submission succeeds
- Audit log entry created

### Use Case 5: Administrator Reviews Audit Logs

1. Login as admin (admin/admin123)
2. Navigate to "View Audit Logs"
3. Apply filters (optional):
   - Date range: Last 7 days
   - User type: All
   - Action type: All
4. Click "Search" or "Apply Filters"

**Expected Results**:
- Audit log entries display in table format
- Sortable by timestamp (newest first)
- Includes all previous test actions

## Patient Self-Service Testing

1. Login as patient (john.doe/patient123)
2. Dashboard automatically displays personal medical information
3. Verify read-only access to:
   - Personal demographics
   - Visit history
   - Vital signs from visits
   - Current prescriptions

**Expected Results**:
- Only patient's own data visible
- No edit capabilities available
- Clean, organized display of medical information

## Troubleshooting

### Container Issues

**Problem**: Containers fail to start
**Solution**:
```bash
# Stop all containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Rebuild and start
docker-compose up --build
```

**Problem**: Port conflicts
**Solution**: Change ports in docker-compose.yml or stop conflicting services

### Database Issues

**Problem**: Database not initialized
**Solution**: Check container logs:
```bash
docker-compose logs backend
```

**Problem**: Seed data missing
**Solution**: Database is initialized on first startup. If issues persist, remove database volume and restart.

### Frontend Issues

**Problem**: Frontend not loading
**Solution**: Check if port 3000 is available and frontend container is running:
```bash
docker-compose ps
```

### Authentication Issues

**Problem**: Cannot login with test credentials
**Solution**: Verify credentials match exactly (case-sensitive). Check browser console for errors.

**Problem**: Wrong dashboard after login
**Solution**: Clear browser localStorage and try again. Verify user role in database matches expected dashboard.

## Development Workflow

### Making Code Changes

1. **Frontend changes**:
   ```bash
   # Edit files in frontend/src/
   # Changes auto-reload in browser
   ```

2. **Backend changes**:
   ```bash
   # Edit files in backend/src/
   # Restart backend container
   docker-compose restart backend
   ```

3. **Database changes**:
   ```bash
   # Edit backend/src/database/seed.js
   # Restart with fresh database
   docker-compose down -v
   docker-compose up --build
   ```

### Viewing Logs

```bash
# All container logs
docker-compose logs

# Specific service logs
docker-compose logs frontend
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f backend
```

## Architecture Overview

### Containers
- **frontend**: React app served by Nginx (port 3000)
- **backend**: Node.js/Express API server (port 5000)
- **database**: SQLite database (file-based, persisted in volume)

### Key Technologies
- **Frontend**: React, React Router, Axios, CSS
- **Backend**: Node.js, Express, SQLite3
- **Database**: SQLite with relational schema
- **Containerization**: Docker, Docker Compose

### Security Features
- Role-based access control
- Audit logging for HIPAA compliance
- Input validation and sanitization
- Session-based authentication (localStorage)

## API Testing

You can test the API directly using tools like Postman or curl:

```bash
# Login example
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dr.smith","password":"physician123"}'
```

See `contracts/api-contracts.md` for complete API documentation.

## Success Criteria Verification

After setup, verify these performance targets:
- ✅ Login completes in < 5 seconds
- ✅ Patient records load in < 3 seconds
- ✅ Vital sign updates complete in < 2 seconds
- ✅ Billing generation finishes in < 5 seconds
- ✅ Audit log queries return in < 3 seconds

The system is now ready for demonstration of all five core healthcare use cases with proper role-based access control and HIPAA-compliant audit logging.
