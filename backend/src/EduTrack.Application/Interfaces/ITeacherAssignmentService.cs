using EduTrack.Application.Common;
using EduTrack.Application.DTOs;

namespace EduTrack.Application.Interfaces;

public interface ITeacherAssignmentService
{
    Task<PagedResult<TeacherAssignmentDto>> GetAllAsync(TeacherAssignmentQuery query, CancellationToken ct = default);
    Task<TeacherAssignmentDto> CreateAsync(CreateTeacherAssignmentRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
