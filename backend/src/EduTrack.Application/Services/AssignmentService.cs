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

public class AssignmentService : IAssignmentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogger _auditLogger;

    public AssignmentService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUser, IAuditLogger auditLogger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUser = currentUser;
        _auditLogger = auditLogger;
    }

    public async Task<PagedResult<AssignmentDto>> GetAllAsync(AssignmentQuery query, CancellationToken ct = default)
    {
        var q = ScopedQuery();

        if (query.Status is not null) q = q.Where(a => a.Status == query.Status);
        if (query.ClassId is not null) q = q.Where(a => a.TeacherAssignment.ClassId == query.ClassId);
        if (query.SubjectId is not null) q = q.Where(a => a.TeacherAssignment.SubjectId == query.SubjectId);
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(a => a.Title.ToLower().Contains(term));
        }

        q = query.SortDir == "desc" ? q.OrderByDescending(a => a.DueDate) : q.OrderBy(a => a.DueDate);

        return await q.ProjectTo<AssignmentDto>(_mapper.ConfigurationProvider).ToPagedResultAsync(query.Page, query.PageSize, ct);
    }

    public async Task<AssignmentDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var assignment = await LoadWithIncludesAsync(id, ct) ?? throw new NotFoundException(nameof(Assignment), id);
        EnsureCanView(assignment);
        return _mapper.Map<AssignmentDto>(assignment);
    }

    public async Task<AssignmentDto> CreateAsync(CreateAssignmentRequest request, CancellationToken ct = default)
    {
        var teacherAssignment = await _unitOfWork.TeacherAssignments.Query()
            .Include(t => t.Class).Include(t => t.Subject).Include(t => t.Teacher)
            .FirstOrDefaultAsync(t => t.Id == request.TeacherAssignmentId, ct)
            ?? throw new NotFoundException(nameof(TeacherAssignment), request.TeacherAssignmentId);

        if (teacherAssignment.TeacherId != _currentUser.UserId)
        {
            throw new ForbiddenException("You can only create assignments for your own teaching assignments.");
        }

        var assignment = new Assignment
        {
            TeacherAssignmentId = teacherAssignment.Id,
            Title = request.Title,
            Description = request.Description,
            MaxMarks = request.MaxMarks,
            DueDate = request.DueDate,
            AllowResubmission = request.AllowResubmission,
            Status = AssignmentStatus.Draft
        };

        await _unitOfWork.Assignments.AddAsync(assignment, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Create", nameof(Assignment), assignment.Id, ct: ct);

        return ToDto(assignment, teacherAssignment);
    }

    public async Task<AssignmentDto> UpdateAsync(Guid id, UpdateAssignmentRequest request, CancellationToken ct = default)
    {
        var assignment = await LoadWithIncludesAsync(id, ct) ?? throw new NotFoundException(nameof(Assignment), id);
        EnsureOwnedByCurrentTeacher(assignment);

        var tracked = await _unitOfWork.Assignments.GetByIdAsync(id, ct);
        tracked!.Title = request.Title;
        tracked.Description = request.Description;
        tracked.MaxMarks = request.MaxMarks;
        tracked.DueDate = request.DueDate;
        tracked.AllowResubmission = request.AllowResubmission;

        _unitOfWork.Assignments.Update(tracked);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Update", nameof(Assignment), assignment.Id, ct: ct);

        var updated = await LoadWithIncludesAsync(id, ct);
        return ToDto(updated!, updated!.TeacherAssignment);
    }

    public async Task<AssignmentDto> UpdateStatusAsync(Guid id, UpdateAssignmentStatusRequest request, CancellationToken ct = default)
    {
        var assignment = await LoadWithIncludesAsync(id, ct) ?? throw new NotFoundException(nameof(Assignment), id);
        EnsureOwnedByCurrentTeacher(assignment);

        var tracked = await _unitOfWork.Assignments.GetByIdAsync(id, ct);
        tracked!.Status = request.Status;
        _unitOfWork.Assignments.Update(tracked);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("StatusChange", nameof(Assignment), assignment.Id, request.Status.ToString(), ct);

        var updated = await LoadWithIncludesAsync(id, ct);
        return ToDto(updated!, updated!.TeacherAssignment);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var assignment = await LoadWithIncludesAsync(id, ct) ?? throw new NotFoundException(nameof(Assignment), id);
        EnsureOwnedByCurrentTeacher(assignment);

        var hasSubmissions = await _unitOfWork.Submissions.Query().AnyAsync(s => s.AssignmentId == id, ct);
        if (hasSubmissions)
        {
            throw new BusinessRuleException("Cannot delete an assignment that already has submissions.");
        }

        var tracked = await _unitOfWork.Assignments.GetByIdAsync(id, ct);
        _unitOfWork.Assignments.Remove(tracked!);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Delete", nameof(Assignment), assignment.Id, ct: ct);
    }

    private IQueryable<Assignment> ScopedQuery()
    {
        var q = _unitOfWork.Assignments.Query()
            .Include(a => a.TeacherAssignment).ThenInclude(t => t.Class)
            .Include(a => a.TeacherAssignment).ThenInclude(t => t.Subject)
            .Include(a => a.TeacherAssignment).ThenInclude(t => t.Teacher);

        return _currentUser.Role switch
        {
            RoleName.Teacher => q.Where(a => a.TeacherAssignment.TeacherId == _currentUser.UserId),
            RoleName.Student => q.Where(a => a.Status == AssignmentStatus.Published && a.TeacherAssignment.ClassId == _currentUser.ClassId),
            _ => q
        };
    }

    private Task<Assignment?> LoadWithIncludesAsync(Guid id, CancellationToken ct) =>
        _unitOfWork.Assignments.Query()
            .Include(a => a.TeacherAssignment).ThenInclude(t => t.Class)
            .Include(a => a.TeacherAssignment).ThenInclude(t => t.Subject)
            .Include(a => a.TeacherAssignment).ThenInclude(t => t.Teacher)
            .FirstOrDefaultAsync(a => a.Id == id, ct);

    private void EnsureCanView(Assignment assignment)
    {
        if (_currentUser.Role == RoleName.Teacher && assignment.TeacherAssignment.TeacherId != _currentUser.UserId)
        {
            throw new ForbiddenException("You do not have access to this assignment.");
        }

        if (_currentUser.Role == RoleName.Student &&
            (assignment.Status != AssignmentStatus.Published || assignment.TeacherAssignment.ClassId != _currentUser.ClassId))
        {
            throw new ForbiddenException("This assignment is not available to you.");
        }
    }

    private void EnsureOwnedByCurrentTeacher(Assignment assignment)
    {
        if (assignment.TeacherAssignment.TeacherId != _currentUser.UserId)
        {
            throw new ForbiddenException("You can only manage your own assignments.");
        }
    }

    private static AssignmentDto ToDto(Assignment a, TeacherAssignment ta) => new(
        a.Id, a.Title, a.Description, a.MaxMarks, a.DueDate, a.Status, a.AllowResubmission, a.AttachmentUrl,
        ta.Id, ta.ClassId, ta.Class.Name, ta.SubjectId, ta.Subject.Name, ta.TeacherId, ta.Teacher.FullName,
        a.CreatedAt, a.UpdatedAt);
}
