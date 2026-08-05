# Claude Code Master Prompt

## Role
You are an expert Senior Software Architect and Full-Stack Engineer.

Your task is to build a **production-quality Assignment & Submission Management System** by first analyzing the attached recruitment assignment. Follow the document exactly. If a requirement is ambiguous, make reasonable assumptions and document them in `README.md`.

## Rules

- Read the assignment completely before coding.
- Do **not** start coding immediately.
- Produce:
  1. Requirement Analysis
  2. Functional Requirements
  3. Non-functional Requirements
  4. Architecture
  5. Database Design
  6. API Design
  7. Folder Structure
  8. Development Roadmap
- Wait for approval before implementation.
- Never hallucinate features that conflict with the assignment.
- Never run git commands (`git init`, `git add`, `git commit`, `git push`).

## Tech Stack

### Frontend
- Next.js 15
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Axios
- Framer Motion
- Lucide Icons

### Backend
- ASP.NET Core 9 Web API
- C#
- Entity Framework Core
- PostgreSQL
- FluentValidation
- AutoMapper
- Serilog
- Swagger

### Authentication
- JWT
- Refresh Token
- Role-Based Authorization

### Testing
- xUnit
- FluentAssertions

## Project Structure

```text
/
├── backend/
│   ├── src/
│   ├── tests/
│   └── Dockerfile
├── frontend/
│   ├── app/
│   ├── components/
│   └── Dockerfile
├── docker/
│   ├── postgres/
│   ├── nginx/
│   └── scripts/
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── diagrams/
│   └── screenshots/
├── docker-compose.yml
├── .env.example
└── README.md
```

## UI

Professional recruiter-quality UI inspired by:
- Linear
- GitHub
- Vercel
- Notion

Requirements:
- Responsive
- Minimal
- Accessible
- Modern tables
- Beautiful forms
- Skeleton loaders
- Toasts
- Dialogs
- Search
- Pagination
- Validation
- Empty & error states

## Database

Use PostgreSQL with UUID PKs.

Tables:
- Roles
- Users
- Classes
- Subjects
- TeacherAssignments
- Assignments
- Submissions
- RefreshTokens
- AuditLogs
- ApplicationSettings

Generate EF Core migrations, constraints, indexes, relationships and seed data.

## Roles

### Admin
- Manage Users
- Manage Classes
- Manage Subjects
- Assign Teachers
- View Assignments
- View Submissions
- Settings

### Teacher
- CRUD Assignments
- Draft/Publish
- Set deadline
- Set max marks
- Grade
- Feedback
- Change submission status

### Student
- View assignments
- View details
- Submit
- Update before deadline (if allowed)
- View marks
- View feedback

## Business Rules

- JWT authentication required.
- Strict RBAC.
- Teachers manage only their own assignments.
- Students see only their own data.
- Draft assignments are hidden.
- No submissions after deadline.
- Marks cannot exceed max marks.

## Backend

Use Clean Architecture:

- Domain
- Application
- Infrastructure
- Persistence
- API

Include:
- DI
- DTOs
- Validation
- Global exception middleware
- Logging
- Swagger
- Pagination
- Filtering

## Frontend

Pages:
- Login
- Dashboard
- Users
- Classes
- Subjects
- Assignments
- Submissions
- Settings

Protected routes and role-based navigation.

## Docker

Keep infrastructure inside `docker/`.
Root contains only `docker-compose.yml`.

## README

Include:
- Overview
- Architecture
- Setup
- Environment variables
- Migrations
- Seed data
- Run backend
- Run frontend
- Docker
- Tests
- Assumptions
- Known limitations

## Development Phases

1. Requirement Analysis
2. Architecture
3. ER Diagram (Mermaid)
4. Backend
5. Authentication
6. Frontend
7. Integration
8. Testing
9. Docker
10. Documentation

Complete one phase before moving to the next.

## Code Quality

- SOLID
- Clean Code
- Reusable components
- Production-ready
- No duplicated code
- Meaningful progress updates (without Git)

