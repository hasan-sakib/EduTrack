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

public class SubmissionService : ISubmissionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTime;
    private readonly IAuditLogger _auditLogger;

    public SubmissionService(
        IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUser, IDateTimeProvider dateTime, IAuditLogger auditLogger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUser = currentUser;
        _dateTime = dateTime;
        _auditLogger = auditLogger;
    }

    public async Task<PagedResult<SubmissionDto>> GetForAssignmentAsync(Guid assignmentId, SubmissionQuery query, CancellationToken ct = default)
    {
        var assignment = await _unitOfWork.Assignments.Query().Include(a => a.TeacherAssignment)
            .FirstOrDefaultAsync(a => a.Id == assignmentId, ct)
            ?? throw new NotFoundException(nameof(Assignment), assignmentId);

        if (_currentUser.Role == RoleName.Teacher && assignment.TeacherAssignment.TeacherId != _currentUser.UserId)
        {
            throw new ForbiddenException("You do not have access to this assignment's submissions.");
        }

        var q = _unitOfWork.Submissions.Query()
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .Include(s => s.GradedByUser)
            .Where(s => s.AssignmentId == assignmentId);

        if (query.Status is not null) q = q.Where(s => s.Status == query.Status);

        q = query.SortDir == "asc" ? q.OrderBy(s => s.SubmittedAt) : q.OrderByDescending(s => s.SubmittedAt);

        return await q.ProjectTo<SubmissionDto>(_mapper.ConfigurationProvider).ToPagedResultAsync(query.Page, query.PageSize, ct);
    }

    public async Task<SubmissionDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var submission = await LoadWithIncludesAsync(id, ct) ?? throw new NotFoundException(nameof(Submission), id);
        EnsureCanView(submission);
        return _mapper.Map<SubmissionDto>(submission);
    }

    public async Task<SubmissionDto?> GetMySubmissionAsync(Guid assignmentId, CancellationToken ct = default)
    {
        var submission = await _unitOfWork.Submissions.Query()
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .Include(s => s.GradedByUser)
            .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentId == _currentUser.UserId, ct);

        return submission is null ? null : _mapper.Map<SubmissionDto>(submission);
    }

    public async Task<SubmissionDto> SubmitAsync(Guid assignmentId, CreateSubmissionRequest request, CancellationToken ct = default)
    {
        var assignment = await _unitOfWork.Assignments.Query().Include(a => a.TeacherAssignment)
            .FirstOrDefaultAsync(a => a.Id == assignmentId, ct)
            ?? throw new NotFoundException(nameof(Assignment), assignmentId);

        var classId = await _currentUser.GetClassIdAsync(ct);
        if (assignment.Status != AssignmentStatus.Published || assignment.TeacherAssignment.ClassId != classId)
        {
            throw new ForbiddenException("This assignment is not available to you.");
        }

        if (_dateTime.UtcNow > assignment.DueDate)
        {
            throw new BusinessRuleException("The deadline for this assignment has passed.");
        }

        var existing = await _unitOfWork.Submissions.Query()
            .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentId == _currentUser.UserId, ct);

        Guid submissionId;
        if (existing is null)
        {
            var submission = new Submission
            {
                AssignmentId = assignmentId,
                StudentId = _currentUser.UserId,
                Content = request.Content,
                FileUrl = request.FileUrl,
                SubmittedAt = _dateTime.UtcNow,
                IsLate = false,
                Status = SubmissionStatus.Submitted
            };
            await _unitOfWork.Submissions.AddAsync(submission, ct);
            submissionId = submission.Id;
        }
        else
        {
            if (!assignment.AllowResubmission)
            {
                throw new BusinessRuleException("Resubmission is not allowed for this assignment.");
            }

            if (existing.Status is SubmissionStatus.Graded or SubmissionStatus.Returned)
            {
                throw new BusinessRuleException("This submission has already been graded and can no longer be changed.");
            }

            var tracked = await _unitOfWork.Submissions.GetByIdAsync(existing.Id, ct);
            tracked!.Content = request.Content;
            tracked.FileUrl = request.FileUrl;
            tracked.SubmittedAt = _dateTime.UtcNow;
            _unitOfWork.Submissions.Update(tracked);
            submissionId = tracked.Id;
        }

        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Submit", nameof(Submission), submissionId, ct: ct);

        var result = await LoadWithIncludesAsync(submissionId, ct);
        return _mapper.Map<SubmissionDto>(result);
    }

    public async Task<SubmissionDto> GradeAsync(Guid id, GradeSubmissionRequest request, CancellationToken ct = default)
    {
        var submission = await LoadWithIncludesAsync(id, ct) ?? throw new NotFoundException(nameof(Submission), id);

        if (submission.Assignment.TeacherAssignment.TeacherId != _currentUser.UserId)
        {
            throw new ForbiddenException("You can only grade submissions for your own assignments.");
        }

        if (request.Marks > submission.Assignment.MaxMarks)
        {
            throw new BusinessRuleException($"Marks cannot exceed the maximum of {submission.Assignment.MaxMarks}.");
        }

        var tracked = await _unitOfWork.Submissions.GetByIdAsync(submission.Id, ct);
        tracked!.Marks = request.Marks;
        tracked.Feedback = request.Feedback;
        tracked.Status = request.Status;
        tracked.GradedAt = _dateTime.UtcNow;
        tracked.GradedByUserId = _currentUser.UserId;

        _unitOfWork.Submissions.Update(tracked);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Grade", nameof(Submission), submission.Id, ct: ct);

        var result = await LoadWithIncludesAsync(submission.Id, ct);
        return _mapper.Map<SubmissionDto>(result);
    }

    private Task<Submission?> LoadWithIncludesAsync(Guid id, CancellationToken ct) =>
        _unitOfWork.Submissions.Query()
            .Include(s => s.Assignment).ThenInclude(a => a.TeacherAssignment)
            .Include(s => s.Student)
            .Include(s => s.GradedByUser)
            .FirstOrDefaultAsync(s => s.Id == id, ct);

    private void EnsureCanView(Submission submission)
    {
        if (_currentUser.Role == RoleName.Teacher && submission.Assignment.TeacherAssignment.TeacherId != _currentUser.UserId)
        {
            throw new ForbiddenException("You do not have access to this submission.");
        }

        if (_currentUser.Role == RoleName.Student && submission.StudentId != _currentUser.UserId)
        {
            throw new ForbiddenException("You do not have access to this submission.");
        }
    }
}
