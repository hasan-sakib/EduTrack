using AutoMapper;
using AutoMapper.QueryableExtensions;
using EduTrack.Application.Common;
using EduTrack.Application.DTOs;
using EduTrack.Application.Interfaces;
using EduTrack.Domain.Entities;
using EduTrack.Domain.Enums;
using EduTrack.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.Application.Services;

public class TeacherAssignmentService : ITeacherAssignmentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogger _auditLogger;

    public TeacherAssignmentService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUser, IAuditLogger auditLogger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUser = currentUser;
        _auditLogger = auditLogger;
    }

    public async Task<PagedResult<TeacherAssignmentDto>> GetAllAsync(TeacherAssignmentQuery query, CancellationToken ct = default)
    {
        var q = _unitOfWork.TeacherAssignments.Query();

        // Teachers may only ever list their own grants (used to populate "which class/subject can I
        // create an assignment for" pickers) — ignore any caller-supplied TeacherId and force it to self.
        if (_currentUser.Role == RoleName.Teacher)
        {
            q = q.Where(t => t.TeacherId == _currentUser.UserId);
        }
        else if (query.TeacherId is not null)
        {
            q = q.Where(t => t.TeacherId == query.TeacherId);
        }

        if (query.ClassId is not null) q = q.Where(t => t.ClassId == query.ClassId);
        if (query.SubjectId is not null) q = q.Where(t => t.SubjectId == query.SubjectId);

        q = q.OrderByDescending(t => t.CreatedAt);

        return await q.ProjectTo<TeacherAssignmentDto>(_mapper.ConfigurationProvider).ToPagedResultAsync(query.Page, query.PageSize, ct);
    }

    public async Task<TeacherAssignmentDto> CreateAsync(CreateTeacherAssignmentRequest request, CancellationToken ct = default)
    {
        var teacher = await _unitOfWork.Users.Query().Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == request.TeacherId, ct)
            ?? throw new NotFoundException(nameof(User), request.TeacherId);

        if (teacher.Role.Name != RoleName.Teacher)
        {
            throw new BusinessRuleException("The selected user is not a Teacher.");
        }

        var @class = await _unitOfWork.Classes.GetByIdAsync(request.ClassId, ct)
            ?? throw new NotFoundException(nameof(Class), request.ClassId);

        var subject = await _unitOfWork.Subjects.GetByIdAsync(request.SubjectId, ct)
            ?? throw new NotFoundException(nameof(Subject), request.SubjectId);

        var duplicate = await _unitOfWork.TeacherAssignments.Query().AnyAsync(
            t => t.TeacherId == request.TeacherId && t.ClassId == request.ClassId && t.SubjectId == request.SubjectId, ct);
        if (duplicate)
        {
            throw new BusinessRuleException("This teacher is already assigned to this class and subject.");
        }

        var entity = new TeacherAssignment { TeacherId = teacher.Id, ClassId = @class.Id, SubjectId = subject.Id };
        await _unitOfWork.TeacherAssignments.AddAsync(entity, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Create", nameof(TeacherAssignment), entity.Id, ct: ct);

        return new TeacherAssignmentDto(entity.Id, teacher.Id, teacher.FullName, @class.Id, @class.Name, subject.Id, subject.Name, entity.CreatedAt);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.TeacherAssignments.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(TeacherAssignment), id);

        var hasAssignments = await _unitOfWork.Assignments.Query().AnyAsync(a => a.TeacherAssignmentId == id, ct);
        if (hasAssignments)
        {
            throw new BusinessRuleException("Cannot remove this teaching assignment because assignments already exist under it.");
        }

        _unitOfWork.TeacherAssignments.Remove(entity);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Delete", nameof(TeacherAssignment), entity.Id, ct: ct);
    }
}
