using EduTrack.Application.Interfaces;

namespace EduTrack.UnitTests.Fakes;

public class FakeCurrentUserService : ICurrentUserService
{
    public bool IsAuthenticated { get; set; } = true;
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty;
    public Guid? ClassId { get; set; }
    public string? IpAddress { get; set; } = "127.0.0.1";

    public Task<Guid?> GetClassIdAsync(CancellationToken ct = default) => Task.FromResult(ClassId);
}
