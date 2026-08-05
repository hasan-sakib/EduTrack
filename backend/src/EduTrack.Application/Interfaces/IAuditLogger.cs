namespace EduTrack.Application.Interfaces;

public interface IAuditLogger
{
    Task LogAsync(string action, string entityName, Guid? entityId, string? details = null, CancellationToken ct = default);
}
