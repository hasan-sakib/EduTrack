using System.Security.Claims;
using EduTrack.Application.Interfaces;

namespace EduTrack.Api.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUnitOfWork _unitOfWork;

    private bool _classIdFetched;
    private Guid? _cachedClassId;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor, IUnitOfWork unitOfWork)
    {
        _httpContextAccessor = httpContextAccessor;
        _unitOfWork = unitOfWork;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    public Guid UserId => Guid.TryParse(User?.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : Guid.Empty;

    public string Role => User?.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

    public async Task<Guid?> GetClassIdAsync(CancellationToken ct = default)
    {
        if (_classIdFetched) return _cachedClassId;

        var user = IsAuthenticated ? await _unitOfWork.Users.GetByIdAsync(UserId, ct) : null;
        _cachedClassId = user?.ClassId;
        _classIdFetched = true;
        return _cachedClassId;
    }

    public string? IpAddress => _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
}
