using EduTrack.Application.Interfaces;
using EduTrack.Domain.Entities;

namespace EduTrack.Application.Services;

public class AuditLogger : IAuditLogger
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public AuditLogger(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task LogAsync(string action, string entityName, Guid? entityId, string? details = null, CancellationToken ct = default)
    {
        var entry = new AuditLog
        {
            UserId = _currentUser.IsAuthenticated ? _currentUser.UserId : null,
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            Details = details,
            IpAddress = _currentUser.IpAddress
        };

        await _unitOfWork.AuditLogs.AddAsync(entry, ct);
        await _unitOfWork.SaveChangesAsync(ct);
    }
}
