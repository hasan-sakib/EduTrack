using EduTrack.Domain.Common;
using EduTrack.Domain.Enums;

namespace EduTrack.Domain.Entities;

public class Submission : BaseEntity
{
    public Guid AssignmentId { get; set; }
    public Assignment Assignment { get; set; } = default!;

    public Guid StudentId { get; set; }
    public User Student { get; set; } = default!;

    public string? Content { get; set; }
    public string? FileUrl { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public bool IsLate { get; set; }
    public SubmissionStatus Status { get; set; } = SubmissionStatus.Submitted;

    public int? Marks { get; set; }
    public string? Feedback { get; set; }
    public DateTimeOffset? GradedAt { get; set; }
    public Guid? GradedByUserId { get; set; }
    public User? GradedByUser { get; set; }
}
