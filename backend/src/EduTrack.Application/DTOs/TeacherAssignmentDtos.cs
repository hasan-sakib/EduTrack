namespace EduTrack.Application.DTOs;

public record TeacherAssignmentDto(
    Guid Id, Guid TeacherId, string TeacherName, Guid ClassId, string ClassName, Guid SubjectId, string SubjectName, DateTimeOffset CreatedAt);

public record CreateTeacherAssignmentRequest(Guid TeacherId, Guid ClassId, Guid SubjectId);

public class TeacherAssignmentQuery : Common.PagedQuery
{
    public Guid? TeacherId { get; set; }
    public Guid? ClassId { get; set; }
    public Guid? SubjectId { get; set; }
}
