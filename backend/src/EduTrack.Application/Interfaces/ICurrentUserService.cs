namespace EduTrack.Application.Interfaces;

public interface ICurrentUserService
{
    bool IsAuthenticated { get; }
    Guid UserId { get; }
    string Role { get; }
    /// <summary>Set only for Students — the class they belong to.</summary>
    Guid? ClassId { get; }

    /// <summary>Caller's IP, for audit logging. Populated at the API layer.</summary>
    string? IpAddress { get; }
}
