using EduTrack.Application.DTOs;
using EduTrack.Application.Interfaces;
using EduTrack.Domain.Entities;
using EduTrack.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IDateTimeProvider _dateTime;
    private readonly IAuditLogger _auditLogger;

    public AuthService(
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IDateTimeProvider dateTime,
        IAuditLogger auditLogger)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _dateTime = dateTime;
        _auditLogger = auditLogger;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.Query()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email, ct);

        if (user is null || !user.IsActive || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new AuthenticationException("Invalid email or password.");
        }

        var response = await IssueTokensAsync(user, ipAddress, ct);
        await _auditLogger.LogAsync("Login", "User", user.Id, ct: ct);
        return response;
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken, string? ipAddress, CancellationToken ct = default)
    {
        var tokenHash = _tokenService.HashToken(refreshToken);

        var existing = await _unitOfWork.RefreshTokens.Query()
            .Include(rt => rt.User).ThenInclude(u => u.Role)
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, ct);

        if (existing is null || !existing.IsActive)
        {
            throw new AuthenticationException("Invalid or expired refresh token.");
        }

        var newPlainToken = _tokenService.GenerateRefreshToken();
        var newTokenEntity = new RefreshToken
        {
            UserId = existing.UserId,
            TokenHash = newPlainToken.Hash,
            ExpiresAt = newPlainToken.ExpiresAt,
            CreatedByIp = ipAddress
        };

        existing.RevokedAt = _dateTime.UtcNow;
        existing.ReplacedByTokenId = newTokenEntity.Id;
        _unitOfWork.RefreshTokens.Update(existing);
        await _unitOfWork.RefreshTokens.AddAsync(newTokenEntity, ct);

        var accessToken = _tokenService.GenerateAccessToken(existing.User);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("TokenRefresh", "User", existing.UserId, ct: ct);

        return new AuthResponse(
            accessToken.Value,
            accessToken.ExpiresAt,
            newPlainToken.Value,
            newPlainToken.ExpiresAt,
            ToCurrentUserDto(existing.User));
    }

    public async Task LogoutAsync(string refreshToken, CancellationToken ct = default)
    {
        var tokenHash = _tokenService.HashToken(refreshToken);
        var existing = await _unitOfWork.RefreshTokens.Query().FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, ct);
        if (existing is null || existing.RevokedAt is not null)
        {
            return;
        }

        existing.RevokedAt = _dateTime.UtcNow;
        _unitOfWork.RefreshTokens.Update(existing);
        await _unitOfWork.SaveChangesAsync(ct);
        await _auditLogger.LogAsync("Logout", "User", existing.UserId, ct: ct);
    }

    public async Task<CurrentUserDto> GetCurrentUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.Query().Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new NotFoundException(nameof(User), userId);

        return ToCurrentUserDto(user);
    }

    private async Task<AuthResponse> IssueTokensAsync(User user, string? ipAddress, CancellationToken ct)
    {
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        await _unitOfWork.RefreshTokens.AddAsync(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = refreshToken.Hash,
            ExpiresAt = refreshToken.ExpiresAt,
            CreatedByIp = ipAddress
        }, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return new AuthResponse(
            accessToken.Value,
            accessToken.ExpiresAt,
            refreshToken.Value,
            refreshToken.ExpiresAt,
            ToCurrentUserDto(user));
    }

    private static CurrentUserDto ToCurrentUserDto(User user) =>
        new(user.Id, user.FullName, user.Email, user.Role.Name, user.ClassId);
}
