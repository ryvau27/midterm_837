# Research Findings: Unified Patient Manager System

**Date**: 2025-11-12
**Feature**: specs/001-unified-patient-manager/spec.md

## Research Summary

All technical decisions have been specified in the user's requirements. No additional research was needed as the technical stack (React + Node.js + SQLite), authentication approach (simple username/password), and containerization (Docker) are clearly defined. The architecture follows standard web application patterns with RESTful API design.

## Technical Decisions

### Frontend Architecture
**Decision**: React with JavaScript, React Router, Axios, simple CSS
**Rationale**: Meets user requirements for JavaScript-only development, provides component-based UI with routing capabilities
**Alternatives Considered**: Vue.js (rejected due to React familiarity in healthcare domain), Vanilla JavaScript (rejected due to complexity for multi-page application)

### Backend Architecture
**Decision**: Node.js with Express, SQLite database
**Rationale**: JavaScript-only requirement satisfied, Express provides simple REST API framework, SQLite offers file-based database suitable for containerization
**Alternatives Considered**: Fastify (overkill for simple REST API), PostgreSQL (rejected due to container complexity), MongoDB (rejected due to relational data requirements)

### Authentication Implementation
**Decision**: Simple username/password comparison with localStorage session storage
**Rationale**: Meets academic demonstration requirements, avoids complex frameworks like JWT or bcrypt as specified
**Alternatives Considered**: JWT tokens (rejected per user requirements), bcrypt hashing (rejected per user requirements), session cookies (localStorage simpler for demo)

### Containerization Strategy
**Decision**: Docker Compose with separate frontend (nginx) and backend containers
**Rationale**: Mandatory per user requirements, enables easy deployment and development environment setup
**Alternatives Considered**: Single container (rejected due to separation of concerns), Kubernetes (overkill for academic project)

### Database Schema Design
**Decision**: Relational SQLite schema with foreign keys for data integrity
**Rationale**: Supports complex relationships between patients, visits, vital signs, prescriptions, and billing records
**Alternatives Considered**: JSON file storage (rejected due to query complexity), NoSQL (rejected due to relational requirements)

## Implementation Patterns

### API Design Patterns
- RESTful endpoints with consistent error/response formats
- Role-based middleware for access control
- Audit logging middleware for all patient data operations

### Frontend State Management
- React Context for authentication state
- Local component state for forms and UI interactions
- Simple props passing for data flow

### Data Validation Patterns
- Client-side validation for user experience
- Server-side validation for security and data integrity
- Medical value range validation for vital signs

## Security Considerations (Academic Level)

### Access Control
- Role-based routing on frontend
- API endpoint protection with role validation
- Patient data isolation (patients can only see own records)

### Audit Compliance
- Automatic logging of all patient data access
- Immutable audit logs (read-only)
- Administrator access for compliance review

### Data Protection
- No sensitive data encryption (academic demonstration)
- Input sanitization and validation
- Clear error messages without data leakage

## Performance Considerations

### Response Time Targets
- Authentication: < 1 second
- Patient record retrieval: < 3 seconds
- Vital sign updates: < 2 seconds
- Billing generation: < 5 seconds
- Audit log queries: < 3 seconds

### Database Optimization
- SQLite indexes on commonly queried fields
- Efficient queries with JOINs for related data
- Connection pooling not needed (single-user demo)

## Deployment Strategy

### Container Configuration
- Frontend: Nginx serving built React app
- Backend: Node.js application with health checks
- Database: SQLite file mounted as Docker volume
- Networking: Internal container communication

### Development Workflow
- Docker Compose for local development
- Hot reloading for frontend development
- Volume mounting for code changes
- Database seeding on container startup

## Conclusion

All technical decisions align with the constitution principles and user requirements. The architecture provides a solid foundation for the healthcare application while maintaining simplicity appropriate for an academic demonstration project. The JavaScript-only constraint is maintained throughout, and the containerized approach ensures consistent deployment.
