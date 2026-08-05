using EduTrack.Application.Common;
using EduTrack.Application.DTOs;

namespace EduTrack.Application.Interfaces;

public interface ISubmissionService
{
    /// <summary>Teacher (own assignment) / Admin (any) — all submissions for an assignment.</summary>
    Task<PagedResult<SubmissionDto>> GetForAssignmentAsync(Guid assignmentId, SubmissionQuery query, CancellationToken ct = default);

    Task<SubmissionDto> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>Student's own submission for an assignment, or null if not yet submitted.</summary>
    Task<SubmissionDto?> GetMySubmissionAsync(Guid assignmentId, CancellationToken ct = default);

    /// <summary>Student creates or (if AllowResubmission and before deadline) resubmits.</summary>
    Task<SubmissionDto> SubmitAsync(Guid assignmentId, CreateSubmissionRequest request, CancellationToken ct = default);

    /// <summary>Teacher grades a submission to one of their own assignments.</summary>
    Task<SubmissionDto> GradeAsync(Guid id, GradeSubmissionRequest request, CancellationToken ct = default);
}
