using EduTrack.Domain.Entities;

namespace EduTrack.Application.Interfaces;

public record AccessToken(string Value, DateTimeOffset ExpiresAt);
public record PlainRefreshToken(string Value, string Hash, DateTimeOffset ExpiresAt);

public interface ITokenService
{
    AccessToken GenerateAccessToken(User user);
    PlainRefreshToken GenerateRefreshToken();
    string HashToken(string token);
}
