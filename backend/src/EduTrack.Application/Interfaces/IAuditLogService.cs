using EduTrack.Application.Common;
using EduTrack.Application.DTOs;

namespace EduTrack.Application.Interfaces;

public interface IAuditLogService
{
    Task<PagedResult<AuditLogDto>> GetAllAsync(AuditLogQuery query, CancellationToken ct = default);
}
