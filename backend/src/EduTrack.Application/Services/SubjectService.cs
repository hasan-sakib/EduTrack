using AutoMapper;
using AutoMapper.QueryableExtensions;
using EduTrack.Application.Common;
using EduTrack.Application.DTOs;
using EduTrack.Application.Interfaces;
using EduTrack.Domain.Entities;
using EduTrack.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.Application.Services;

public class SubjectService : ISubjectService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IAuditLogger _auditLogger;

    public SubjectService(IUnitOfWork unitOfWork, IMapper mapper, IAuditLogger auditLogger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _auditLogger = auditLogger;
    }

    public async Task<PagedResult<SubjectDto>> GetAllAsync(PagedQuery query, CancellationToken ct = default)
    {
        var q = _unitOfWork.Subjects.Query();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(s => s.Name.ToLower().Contains(term) || s.Code.ToLower().Contains(term));
        }

        q = query.SortDir == "desc" ? q.OrderByDescending(s => s.Name) : q.OrderBy(s => s.Name);

        return await q.ProjectTo<SubjectDto>(_mapper.ConfigurationProvider).ToPagedResultAsync(query.Page, query.PageSize, ct);
    }

    public async Task<SubjectDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Subjects.Query().FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new NotFoundException(nameof(Subject), id);
        return _mapper.Map<SubjectDto>(entity);
    }

    public async Task<SubjectDto> CreateAsync(CreateSubjectRequest request, CancellationToken ct = default)
    {
        var exists = await _unitOfWork.Subjects.Query().AnyAsync(s => s.Code == request.Code, ct);
        if (exists)
        {
            throw new BusinessRuleException($"A subject with code '{request.Code}' already exists.");
        }

        var entity = new Subject { Name = request.Name, Code = request.Code, IsActive = true };
        await _unitOfWork.Subjects.AddAsync(entity, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Create", nameof(Subject), entity.Id, ct: ct);

        return _mapper.Map<SubjectDto>(entity);
    }

    public async Task<SubjectDto> UpdateAsync(Guid id, UpdateSubjectRequest request, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Subjects.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(Subject), id);

        entity.Name = request.Name;
        entity.Code = request.Code;
        entity.IsActive = request.IsActive;

        _unitOfWork.Subjects.Update(entity);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Update", nameof(Subject), entity.Id, ct: ct);

        return _mapper.Map<SubjectDto>(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Subjects.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(Subject), id);

        entity.IsActive = false;
        _unitOfWork.Subjects.Update(entity);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Delete", nameof(Subject), entity.Id, ct: ct);
    }
}
