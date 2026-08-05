using AutoMapper;
using AutoMapper.QueryableExtensions;
using EduTrack.Application.Common;
using EduTrack.Application.DTOs;
using EduTrack.Application.Interfaces;

namespace EduTrack.Application.Services;

public class AuditLogService : IAuditLogService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AuditLogService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PagedResult<AuditLogDto>> GetAllAsync(AuditLogQuery query, CancellationToken ct = default)
    {
        var q = _unitOfWork.AuditLogs.Query();

        if (!string.IsNullOrWhiteSpace(query.EntityName))
        {
            q = q.Where(a => a.EntityName == query.EntityName);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(a => a.Action.ToLower().Contains(term) || a.EntityName.ToLower().Contains(term));
        }

        q = q.OrderByDescending(a => a.CreatedAt);

        return await q.ProjectTo<AuditLogDto>(_mapper.ConfigurationProvider).ToPagedResultAsync(query.Page, query.PageSize, ct);
    }
}
