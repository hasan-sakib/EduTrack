using EduTrack.Domain.Common;

namespace EduTrack.Domain.Entities;

public class AssignmentAttachment : BaseEntity
{
    public Guid AssignmentId { get; set; }
    public Assignment Assignment { get; set; } = default!;

    public string FileUrl { get; set; } = default!;
    public string FileName { get; set; } = default!;
}
