using EduTrack.Application.Interfaces;
using EduTrack.Domain.Entities;

namespace EduTrack.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;

        Users = new Repository<User>(_context);
        Roles = new Repository<Role>(_context);
        Classes = new Repository<Class>(_context);
        Subjects = new Repository<Subject>(_context);
        TeacherAssignments = new Repository<TeacherAssignment>(_context);
        Assignments = new Repository<Assignment>(_context);
        Submissions = new Repository<Submission>(_context);
        RefreshTokens = new Repository<RefreshToken>(_context);
        AuditLogs = new Repository<AuditLog>(_context);
        ApplicationSettings = new Repository<ApplicationSetting>(_context);
    }

    public IRepository<User> Users { get; }
    public IRepository<Role> Roles { get; }
    public IRepository<Class> Classes { get; }
    public IRepository<Subject> Subjects { get; }
    public IRepository<TeacherAssignment> TeacherAssignments { get; }
    public IRepository<Assignment> Assignments { get; }
    public IRepository<Submission> Submissions { get; }
    public IRepository<RefreshToken> RefreshTokens { get; }
    public IRepository<AuditLog> AuditLogs { get; }
    public IRepository<ApplicationSetting> ApplicationSettings { get; }

    public Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        _context.SaveChangesAsync(ct);
}
