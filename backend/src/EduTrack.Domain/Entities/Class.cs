using EduTrack.Domain.Common;

namespace EduTrack.Domain.Entities;

public class Class : BaseEntity
{
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<User> Students { get; set; } = new List<User>();
    public ICollection<TeacherAssignment> TeacherAssignments { get; set; } = new List<TeacherAssignment>();
}
