using EduTrack.Domain.Common;

namespace EduTrack.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public bool IsActive { get; set; } = true;

    public Guid RoleId { get; set; }
    public Role Role { get; set; } = default!;

    /// <summary>Only set for Students; the single class they belong to.</summary>
    public Guid? ClassId { get; set; }
    public Class? Class { get; set; }

    public ICollection<TeacherAssignment> TeacherAssignments { get; set; } = new List<TeacherAssignment>();
    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
