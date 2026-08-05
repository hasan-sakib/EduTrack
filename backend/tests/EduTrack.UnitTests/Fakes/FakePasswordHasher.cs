using EduTrack.Application.Interfaces;

namespace EduTrack.UnitTests.Fakes;

/// <summary>Deterministic, fast stand-in for the real BCrypt-backed hasher — plaintext is never used in assertions.</summary>
public class FakePasswordHasher : IPasswordHasher
{
    public string Hash(string password) => $"hashed:{password}";
    public bool Verify(string password, string hash) => hash == $"hashed:{password}";
}
