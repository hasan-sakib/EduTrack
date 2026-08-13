namespace EduTrack.Application.Interfaces;

public interface ICurrentUserService
{
    bool IsAuthenticated { get; }
    Guid UserId { get; }
    string Role { get; }

    /// <summary>
    /// The Student's current class, read fresh from the database rather than from the access
    /// token — a token's "classId" claim is baked in at login/refresh time, so trusting it
    /// directly would let a student keep seeing their old class's assignments (and miss new
    /// ones in their real class) for as long as their token stays valid after being reassigned.
    /// Set only for Students; null otherwise.
    /// </summary>
    Task<Guid?> GetClassIdAsync(CancellationToken ct = default);

    /// <summary>Caller's IP, for audit logging. Populated at the API layer.</summary>
    string? IpAddress { get; }
}
