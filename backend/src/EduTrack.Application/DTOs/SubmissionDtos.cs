using EduTrack.Domain.Enums;

namespace EduTrack.Application.DTOs;

public record SubmissionDto(
    Guid Id,
    Guid AssignmentId,
    string AssignmentTitle,
    int MaxMarks,
    Guid StudentId,
    string StudentName,
    string? Content,
    string? FileUrl,
    DateTimeOffset SubmittedAt,
    bool IsLate,
    SubmissionStatus Status,
    int? Marks,
    string? Feedback,
    DateTimeOffset? GradedAt,
    string? GradedByName);

public record CreateSubmissionRequest(string? Content, string? FileUrl);

public record GradeSubmissionRequest(int Marks, string? Feedback, SubmissionStatus Status);

public class SubmissionQuery : Common.PagedQuery
{
    public SubmissionStatus? Status { get; set; }
}
