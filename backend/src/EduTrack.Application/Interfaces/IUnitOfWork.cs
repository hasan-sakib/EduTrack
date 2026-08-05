using EduTrack.Domain.Entities;

namespace EduTrack.Application.Interfaces;

public interface IUnitOfWork
{
    IRepository<User> Users { get; }
    IRepository<Role> Roles { get; }
    IRepository<Class> Classes { get; }
    IRepository<Subject> Subjects { get; }
    IRepository<TeacherAssignment> TeacherAssignments { get; }
    IRepository<Assignment> Assignments { get; }
    IRepository<Submission> Submissions { get; }
    IRepository<RefreshToken> RefreshTokens { get; }
    IRepository<AuditLog> AuditLogs { get; }
    IRepository<ApplicationSetting> ApplicationSettings { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
