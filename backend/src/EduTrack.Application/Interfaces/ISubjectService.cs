using EduTrack.Application.Common;
using EduTrack.Application.DTOs;

namespace EduTrack.Application.Interfaces;

public interface ISubjectService
{
    Task<PagedResult<SubjectDto>> GetAllAsync(PagedQuery query, CancellationToken ct = default);
    Task<SubjectDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<SubjectDto> CreateAsync(CreateSubjectRequest request, CancellationToken ct = default);
    Task<SubjectDto> UpdateAsync(Guid id, UpdateSubjectRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
