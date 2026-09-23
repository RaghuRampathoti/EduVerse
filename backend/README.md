# EduVerse Backend

Java 17 · Spring Boot 3.3 · Spring Security 6 (JWT) · Spring Data JPA · PostgreSQL

## Package layout

```
com.eduverse
├── entity        JPA entities (Institution, User, StudentProfile, FacultyProfile,
│                 ParentProfile, ClassSection, StudentAttendance, FacultyAttendance,
│                 FeeStructure, FeePayment, Announcement, enums)
├── repository    Spring Data JPA repositories, one per entity
├── dto
│   ├── request   Request payload records
│   └── response  Response payload records (mapped from entities via static `from()`)
├── service       Interfaces
│   └── impl      Implementations (business logic, multi-tenant scoping)
├── controller    REST controllers (one per resource area)
├── security      JWT generation/validation, Spring Security UserDetails glue
├── config        Security filter chain, CORS, JPA auditing, data seeding, typed
│                 @ConfigurationProperties
└── exception     Custom exceptions + @RestControllerAdvice global handler
```

## How multi-tenancy works

Every table except `institutions` and the Master Admin's own `app_users` row has
an `institution_id`. Every service method scopes its queries to
`principal.getInstitutionId()`, which is embedded in the JWT at login. This means
the same `/api/admin/**` and `/api/faculty/**` etc. endpoints are safe to share
across institutions — a Super Admin or Admin can only ever see their own data.

## Auth flow

1. `POST /api/auth/login` → `{ accessToken, refreshToken, user }`. Access tokens
   last 24h, refresh tokens 7 days (see `application.yml`).
2. Send `Authorization: Bearer <accessToken>` on every subsequent request.
3. On a 401, the frontend's axios interceptor automatically calls
   `POST /api/auth/refresh` and retries once.
4. Every account created by someone else (Master Admin creating a Super Admin,
   Admin creating a Student, etc.) gets `mustChangePassword=true` and a
   random temporary password returned once in the API response. The frontend
   routes such users straight to `/change-password` after login.

## API reference (high level)

| Base path | Roles | Purpose |
|---|---|---|
| `/api/auth/**` | public / any | login, refresh, me, change-password |
| `/api/master/**` | MASTER_ADMIN | institution CRUD, platform dashboard |
| `/api/institution/**` | SUPER_ADMIN | own institution profile, Admin account management |
| `/api/admin/**` | SUPER_ADMIN, ADMIN | classes, students, faculty, fees, faculty-attendance |
| `/api/faculty/**` | SUPER_ADMIN, ADMIN, FACULTY | faculty self-profile, mark/view class attendance |
| `/api/student/**` | SUPER_ADMIN, ADMIN, STUDENT | student self-profile, own attendance/fees |
| `/api/parent/**` | SUPER_ADMIN, ADMIN, PARENT | linked children + their attendance/fees |
| `/api/announcements/**` | any authenticated | read (audience-filtered) / post (staff only) |

Every response is wrapped as `{ success, message, data }`. Validation and
business-rule errors return `{ success:false, message, status, fieldErrors? }`
with the matching HTTP status code.

## Extending to more modules

The codebase intentionally keeps a consistent, repeatable pattern:
`Entity → Repository → (Request/Response DTOs) → Service/ServiceImpl → Controller`.
To add a new module (e.g. Library, Transport, Exams) follow the same five steps
used for e.g. `FeeStructure`/`FeePayment` and it will slot into the existing
security rules, multi-tenant scoping, and exception handling automatically.

## Configuration

All configuration is externalized via environment variables in
`src/main/resources/application.yml` — see the root `README.md` for the ones
you need to set to run locally.
