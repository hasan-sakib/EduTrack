using EduTrack.Domain.Enums;

namespace EduTrack.Application.DTOs;

public record AssignmentDto(
    Guid Id,
    string Title,
    string Description,
    int MaxMarks,
    DateTimeOffset DueDate,
    AssignmentStatus Status,
    bool AllowResubmission,
    string? AttachmentUrl,
    Guid TeacherAssignmentId,
    Guid ClassId,
    string ClassName,
    Guid SubjectId,
    string SubjectName,
    Guid TeacherId,
    string TeacherName,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public record CreateAssignmentRequest(
    Guid TeacherAssignmentId, string Title, string Description, int MaxMarks, DateTimeOffset DueDate, bool AllowResubmission);

public record UpdateAssignmentRequest(
    string Title, string Description, int MaxMarks, DateTimeOffset DueDate, bool AllowResubmission);

public record UpdateAssignmentStatusRequest(AssignmentStatus Status);

public class AssignmentQuery : Common.PagedQuery
{
    public AssignmentStatus? Status { get; set; }
    public Guid? ClassId { get; set; }
    public Guid? SubjectId { get; set; }
}
