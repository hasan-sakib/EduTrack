using EduTrack.Domain.Common;

namespace EduTrack.Domain.Entities;

/// <summary>A grant that a Teacher may teach a given Subject to a given Class.</summary>
public class TeacherAssignment : BaseEntity
{
    public Guid TeacherId { get; set; }
    public User Teacher { get; set; } = default!;

    public Guid ClassId { get; set; }
    public Class Class { get; set; } = default!;

    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = default!;

    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}
