using EduTrack.Application.Interfaces;

namespace EduTrack.UnitTests.Fakes;

public class NoOpAuditLogger : IAuditLogger
{
    public Task LogAsync(string action, string entityName, Guid? entityId, string? details = null, CancellationToken ct = default) =>
        Task.CompletedTask;
}
