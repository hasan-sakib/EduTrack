using EduTrack.Domain.Common;

namespace EduTrack.Domain.Entities;

public class Subject : BaseEntity
{
    public string Name { get; set; } = default!;
    public string Code { get; set; } = default!;
    public bool IsActive { get; set; } = true;

    public ICollection<TeacherAssignment> TeacherAssignments { get; set; } = new List<TeacherAssignment>();
}
