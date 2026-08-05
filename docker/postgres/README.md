# Postgres

No init scripts are needed here — the backend applies EF Core migrations and seeds demo data
automatically on startup (see `EduTrack.Api/Program.cs`). This directory exists so all
infrastructure config has a home under `docker/`, per the project layout convention.
