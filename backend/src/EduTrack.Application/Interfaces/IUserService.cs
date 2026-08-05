using EduTrack.Application.Common;
using EduTrack.Application.DTOs;

namespace EduTrack.Application.Interfaces;

public interface IUserService
{
    Task<PagedResult<UserDto>> GetAllAsync(UserQuery query, CancellationToken ct = default);
    Task<UserDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken ct = default);
    Task<UserDto> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
