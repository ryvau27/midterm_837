# Unified Patient Manager (UPM) System

A healthcare application providing centralized access to patient medical records with role-based access control and simplified audit logging.

## Prerequisites

- Docker and Docker Compose installed
- At least 2GB free RAM
- Ports 3000 and 5000 available on localhost

## Quick Start

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

## Use Cases

### 1. User Authentication
- Login with role-based credentials
- Automatic redirection to appropriate dashboard
- Session management via localStorage

### 2. Physician Accesses Patient Records
- Search patients by name or ID
- View complete medical records including vitals and prescriptions
- Access patient visit history

### 3. Nurse Updates Patient Vitals
- Record vital signs (temperature, blood pressure, heart rate, respiratory rate)
- Input validation with medical ranges
- Treatment notes documentation

### 4. Physician Generates Billing
- View unbilled visits
- Generate billing summaries with cost calculations
- Mock insurance provider integration

### 5. Administrator Reviews Audit Logs
- View login attempts (successful and failed)
- Filter by date range and user type
- Basic accountability tracking

### 6. Patient Self-Service
- View personal medical records
- Read-only access to own data
- Medical history and current prescriptions

## Architecture

### Technology Stack
- **Frontend**: React with JavaScript, React Router, Axios
- **Backend**: Node.js with Express, SQLite database
- **Containerization**: Docker and Docker Compose

### Project Structure
```
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth and validation
│   │   ├── services/       # Business logic
│   │   ├── database/       # DB setup and seed data
│   │   └── utils/          # Helper functions
│   ├── package.json
│   ├── server.js
│   └── Dockerfile
├── frontend/                # React application
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Dashboard pages
│   │   ├── services/       # API integration
│   │   ├── context/        # Authentication context
│   │   └── utils/          # Helper functions
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml       # Container orchestration
└── README.md
```

## Development

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

## API Documentation

See `specs/001-unified-patient-manager/contracts/api-contracts.md` for complete API documentation including endpoints, request/response formats, and authentication requirements.

## Testing

The application includes manual testing scenarios for all use cases. Access the application at http://localhost:3000 and use the pre-configured test users to verify functionality.

## Troubleshooting

### Container Issues
```bash
# Stop all containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Rebuild and start
docker-compose up --build
```

### Database Issues
Check container logs: `docker-compose logs backend`

## Academic Project Notes

This is a simplified healthcare demonstration system designed for educational purposes:

- **No HIPAA compliance** - Simplified for school project requirements
- **Mock data and services** - All external systems simulated
- **Plain text authentication** - No encryption for demonstration
- **Basic audit logging** - Only login attempts tracked
- **Manual testing only** - No automated test suites required

## License

MIT License - Academic Project
