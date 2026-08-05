using AutoMapper;
using AutoMapper.QueryableExtensions;
using EduTrack.Application.Common;
using EduTrack.Application.DTOs;
using EduTrack.Application.Interfaces;
using EduTrack.Domain.Entities;
using EduTrack.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.Application.Services;

public class ClassService : IClassService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IAuditLogger _auditLogger;

    public ClassService(IUnitOfWork unitOfWork, IMapper mapper, IAuditLogger auditLogger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _auditLogger = auditLogger;
    }

    public async Task<PagedResult<ClassDto>> GetAllAsync(PagedQuery query, CancellationToken ct = default)
    {
        var q = _unitOfWork.Classes.Query();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(c => c.Name.ToLower().Contains(term));
        }

        q = query.SortDir == "desc" ? q.OrderByDescending(c => c.Name) : q.OrderBy(c => c.Name);

        return await q.ProjectTo<ClassDto>(_mapper.ConfigurationProvider).ToPagedResultAsync(query.Page, query.PageSize, ct);
    }

    public async Task<ClassDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Classes.Query().FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException(nameof(Class), id);
        return _mapper.Map<ClassDto>(entity);
    }

    public async Task<ClassDto> CreateAsync(CreateClassRequest request, CancellationToken ct = default)
    {
        var exists = await _unitOfWork.Classes.Query().AnyAsync(c => c.Name == request.Name, ct);
        if (exists)
        {
            throw new BusinessRuleException($"A class named '{request.Name}' already exists.");
        }

        var entity = new Class { Name = request.Name, Description = request.Description, IsActive = true };
        await _unitOfWork.Classes.AddAsync(entity, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Create", nameof(Class), entity.Id, ct: ct);

        return new ClassDto(entity.Id, entity.Name, entity.Description, entity.IsActive, 0, entity.CreatedAt);
    }

    public async Task<ClassDto> UpdateAsync(Guid id, UpdateClassRequest request, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Classes.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(Class), id);

        entity.Name = request.Name;
        entity.Description = request.Description;
        entity.IsActive = request.IsActive;

        _unitOfWork.Classes.Update(entity);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Update", nameof(Class), entity.Id, ct: ct);

        var studentCount = await _unitOfWork.Users.Query().CountAsync(u => u.ClassId == entity.Id, ct);
        return new ClassDto(entity.Id, entity.Name, entity.Description, entity.IsActive, studentCount, entity.CreatedAt);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Classes.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(Class), id);

        entity.IsActive = false;
        _unitOfWork.Classes.Update(entity);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Delete", nameof(Class), entity.Id, ct: ct);
    }
}
