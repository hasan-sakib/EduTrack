using EduTrack.Application.Common;
using EduTrack.Application.DTOs;

namespace EduTrack.Application.Interfaces;

/// <summary>
/// All methods are scoped by the caller's identity via <see cref="ICurrentUserService"/>:
/// Admin sees everything, a Teacher sees/manages only assignments under their own
/// TeacherAssignments, a Student sees only Published assignments for their own class.
/// </summary>
public interface IAssignmentService
{
    Task<PagedResult<AssignmentDto>> GetAllAsync(AssignmentQuery query, CancellationToken ct = default);
    Task<AssignmentDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<AssignmentDto> CreateAsync(CreateAssignmentRequest request, CancellationToken ct = default);
    Task<AssignmentDto> UpdateAsync(Guid id, UpdateAssignmentRequest request, CancellationToken ct = default);
    Task<AssignmentDto> UpdateStatusAsync(Guid id, UpdateAssignmentStatusRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
