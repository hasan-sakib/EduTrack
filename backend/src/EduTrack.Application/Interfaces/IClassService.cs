using EduTrack.Application.Common;
using EduTrack.Application.DTOs;

namespace EduTrack.Application.Interfaces;

public interface IClassService
{
    Task<PagedResult<ClassDto>> GetAllAsync(PagedQuery query, CancellationToken ct = default);
    Task<ClassDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ClassDto> CreateAsync(CreateClassRequest request, CancellationToken ct = default);
    Task<ClassDto> UpdateAsync(Guid id, UpdateClassRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
