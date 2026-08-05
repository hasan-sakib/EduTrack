namespace EduTrack.Application.DTOs;

public record LoginRequest(string Email, string Password);

public record RefreshRequest(string RefreshToken);

public record AuthResponse(string AccessToken, DateTimeOffset AccessTokenExpiresAt, string RefreshToken, DateTimeOffset RefreshTokenExpiresAt, CurrentUserDto User);

public record CurrentUserDto(Guid Id, string FullName, string Email, string Role, Guid? ClassId);
