# API Documentation

The API is self-documenting via Swagger/OpenAPI, generated directly from the controllers, DTOs, and
FluentValidation rules — kept here as a pointer rather than a hand-maintained duplicate that would
drift out of sync with the code.

- **Running locally**: `http://localhost:5000/swagger` (or whatever port `dotnet run` prints)
- **Running via Docker Compose**: `http://localhost:8080/swagger`

Authenticate via `POST /api/v1/auth/login`, then click **Authorize** in the Swagger UI and paste the
returned `accessToken` (as `Bearer <token>`) to call protected endpoints interactively.

See `docs/architecture/architecture.md` §API design conventions (pagination envelope, `ProblemDetails`
error shape) and the endpoint table in the approved plan for the full route list grouped by resource.
