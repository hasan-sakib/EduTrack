using EduTrack.Domain.Common;
using EduTrack.Domain.Enums;

namespace EduTrack.Domain.Entities;

public class Assignment : BaseEntity
{
    public Guid TeacherAssignmentId { get; set; }
    public TeacherAssignment TeacherAssignment { get; set; } = default!;

    public string Title { get; set; } = default!;
    public string Description { get; set; } = default!;
    public int MaxMarks { get; set; }
    public DateTimeOffset DueDate { get; set; }
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Draft;
    public bool AllowResubmission { get; set; }
    public string? AttachmentUrl { get; set; }

    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}
