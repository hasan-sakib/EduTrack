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
        var q = await ScopedQueryAsync(ct);

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
        await EnsureCanViewAsync(assignment, ct);
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
            Topic = request.Topic,
            // Published immediately — no separate draft/publish step; students in the class
            // should see it as soon as it's created.
            Status = AssignmentStatus.Published
        };

        await _unitOfWork.Assignments.AddAsync(assignment, ct);

        foreach (var attachment in request.Attachments ?? [])
        {
            await _unitOfWork.AssignmentAttachments.AddAsync(new AssignmentAttachment
            {
                AssignmentId = assignment.Id,
                FileUrl = attachment.FileUrl,
                FileName = attachment.FileName,
            }, ct);
        }

        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Create", nameof(Assignment), assignment.Id, ct: ct);

        var created = await LoadWithIncludesAsync(assignment.Id, ct);
        return ToDto(created!, teacherAssignment);
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
        tracked.Topic = request.Topic;

        _unitOfWork.Assignments.Update(tracked);

        var existingAttachments = await _unitOfWork.AssignmentAttachments.Query()
            .Where(a => a.AssignmentId == id)
            .ToListAsync(ct);
        foreach (var existing in existingAttachments)
        {
            _unitOfWork.AssignmentAttachments.Remove(existing);
        }

        foreach (var attachment in request.Attachments ?? [])
        {
            await _unitOfWork.AssignmentAttachments.AddAsync(new AssignmentAttachment
            {
                AssignmentId = id,
                FileUrl = attachment.FileUrl,
                FileName = attachment.FileName,
            }, ct);
        }

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

    private async Task<IQueryable<Assignment>> ScopedQueryAsync(CancellationToken ct)
    {
        var q = _unitOfWork.Assignments.Query()
            .Include(a => a.TeacherAssignment).ThenInclude(t => t.Class)
            .Include(a => a.TeacherAssignment).ThenInclude(t => t.Subject)
            .Include(a => a.TeacherAssignment).ThenInclude(t => t.Teacher)
            .Include(a => a.Attachments);

        if (_currentUser.Role == RoleName.Teacher)
        {
            return q.Where(a => a.TeacherAssignment.TeacherId == _currentUser.UserId);
        }

        if (_currentUser.Role == RoleName.Student)
        {
            var classId = await _currentUser.GetClassIdAsync(ct);
            return q.Where(a => a.Status == AssignmentStatus.Published && a.TeacherAssignment.ClassId == classId);
        }

        return q;
    }

    private Task<Assignment?> LoadWithIncludesAsync(Guid id, CancellationToken ct) =>
        _unitOfWork.Assignments.Query()
            .Include(a => a.TeacherAssignment).ThenInclude(t => t.Class)
            .Include(a => a.TeacherAssignment).ThenInclude(t => t.Subject)
            .Include(a => a.TeacherAssignment).ThenInclude(t => t.Teacher)
            .Include(a => a.Attachments)
            .FirstOrDefaultAsync(a => a.Id == id, ct);

    private async Task EnsureCanViewAsync(Assignment assignment, CancellationToken ct)
    {
        if (_currentUser.Role == RoleName.Teacher && assignment.TeacherAssignment.TeacherId != _currentUser.UserId)
        {
            throw new ForbiddenException("You do not have access to this assignment.");
        }

        if (_currentUser.Role == RoleName.Student)
        {
            var classId = await _currentUser.GetClassIdAsync(ct);
            if (assignment.Status != AssignmentStatus.Published || assignment.TeacherAssignment.ClassId != classId)
            {
                throw new ForbiddenException("This assignment is not available to you.");
            }
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
        a.Id, a.Title, a.Description, a.MaxMarks, a.DueDate, a.Status, a.AllowResubmission, a.Topic,
        a.Attachments.Select(x => new AssignmentAttachmentDto(x.Id, x.FileUrl, x.FileName)).ToList(),
        ta.Id, ta.ClassId, ClassDisplay.Compose(ta.Class.Name, ta.Class.Section), ta.SubjectId, ta.Subject.Name, ta.TeacherId, ta.Teacher.FullName,
        a.CreatedAt, a.UpdatedAt);
}
