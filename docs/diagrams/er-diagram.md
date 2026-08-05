# Entity-Relationship Diagram

PostgreSQL, UUID primary keys, `CreatedAt`/`UpdatedAt` timestamptz on every table. See `docs/architecture/architecture.md` for the system/backend/frontend architecture and `Claude_Code_Master_Prompt_Assignment_System.md` §Database for the source requirement. Ambiguity resolutions are documented in the approved plan and will be carried into `README.md` → Assumptions.

```mermaid
erDiagram
    ROLES ||--o{ USERS : has
    CLASSES ||--o{ USERS : "enrolls (students)"
    USERS ||--o{ TEACHER_ASSIGNMENTS : "teaches (as Teacher)"
    CLASSES ||--o{ TEACHER_ASSIGNMENTS : "scoped to"
    SUBJECTS ||--o{ TEACHER_ASSIGNMENTS : "scoped to"
    TEACHER_ASSIGNMENTS ||--o{ ASSIGNMENTS : "creates"
    ASSIGNMENTS ||--o{ SUBMISSIONS : receives
    USERS ||--o{ SUBMISSIONS : "submits (as Student)"
    USERS ||--o{ SUBMISSIONS : "grades (GradedBy)"
    USERS ||--o{ REFRESH_TOKENS : owns
    USERS ||--o{ AUDIT_LOGS : performs
    USERS ||--o{ APPLICATION_SETTINGS : "updates"

    ROLES {
        uuid Id PK
        varchar Name UK
    }
    USERS {
        uuid Id PK
        varchar FullName
        varchar Email UK
        varchar PasswordHash
        uuid RoleId FK
        uuid ClassId FK "nullable, students only"
        bool IsActive
        timestamptz CreatedAt
        timestamptz UpdatedAt
    }
    CLASSES {
        uuid Id PK
        varchar Name UK
        varchar Description
        bool IsActive
        timestamptz CreatedAt
        timestamptz UpdatedAt
    }
    SUBJECTS {
        uuid Id PK
        varchar Name
        varchar Code UK
        bool IsActive
        timestamptz CreatedAt
        timestamptz UpdatedAt
    }
    TEACHER_ASSIGNMENTS {
        uuid Id PK
        uuid TeacherId FK
        uuid ClassId FK
        uuid SubjectId FK
        timestamptz CreatedAt
    }
    ASSIGNMENTS {
        uuid Id PK
        uuid TeacherAssignmentId FK
        varchar Title
        text Description
        int MaxMarks
        timestamptz DueDate
        varchar Status "Draft|Published|Closed"
        bool AllowResubmission
        varchar AttachmentUrl "nullable"
        timestamptz CreatedAt
        timestamptz UpdatedAt
    }
    SUBMISSIONS {
        uuid Id PK
        uuid AssignmentId FK
        uuid StudentId FK
        text Content "nullable"
        varchar FileUrl "nullable"
        timestamptz SubmittedAt
        bool IsLate
        varchar Status "Submitted|Graded|Returned"
        int Marks "nullable, <= Assignment.MaxMarks"
        text Feedback "nullable"
        timestamptz GradedAt "nullable"
        uuid GradedByUserId FK "nullable"
        timestamptz CreatedAt
        timestamptz UpdatedAt
    }
    REFRESH_TOKENS {
        uuid Id PK
        uuid UserId FK
        varchar TokenHash
        timestamptz ExpiresAt
        timestamptz RevokedAt "nullable"
        uuid ReplacedByTokenId "nullable"
        varchar CreatedByIp
        timestamptz CreatedAt
    }
    AUDIT_LOGS {
        uuid Id PK
        uuid UserId FK "nullable"
        varchar Action
        varchar EntityName
        uuid EntityId "nullable"
        jsonb Details
        varchar IpAddress
        timestamptz CreatedAt
    }
    APPLICATION_SETTINGS {
        uuid Id PK
        varchar Key UK
        text Value
        varchar Description
        uuid UpdatedByUserId FK "nullable"
        timestamptz UpdatedAt
    }
```

## Key constraints & indexes

- `Users.Email` unique; `Users(RoleId)`, `Users(ClassId)` indexed.
- `TeacherAssignments` unique composite `(TeacherId, ClassId, SubjectId)`.
- `Assignments(TeacherAssignmentId, Status, DueDate)` composite index for list filtering.
- `Submissions` unique composite `(AssignmentId, StudentId)` — one row per student per assignment; edits update the same row while allowed. Indexed on `StudentId`.
- `Submissions.Marks <= Assignments.MaxMarks` is enforced in the Application layer (cross-table check constraints aren't portably expressible in EF Core), not as a DB check constraint. Documented as a known limitation in `README.md`.
- `AuditLogs.Details` is a plain `text` column (free-text description of the change), not `jsonb` — the audit logger only ever writes short human-readable strings, not structured JSON payloads.
- FK delete behavior: `Restrict` on `Classes→Users`, `Subjects/Classes→TeacherAssignments`, `TeacherAssignments→Assignments`, `Assignments→Submissions`. Parents with dependents are soft-deleted (`IsActive = false`) instead of hard-deleted.
