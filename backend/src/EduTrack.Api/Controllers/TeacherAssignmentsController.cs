using EduTrack.Application.DTOs;
using EduTrack.Application.Interfaces;
using EduTrack.Domain.Enums;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.Api.Controllers;

[ApiController]
[Route("api/v1/teacher-assignments")]
[Authorize]
public class TeacherAssignmentsController : ControllerBase
{
    private readonly ITeacherAssignmentService _service;
    private readonly IValidator<CreateTeacherAssignmentRequest> _createValidator;

    public TeacherAssignmentsController(ITeacherAssignmentService service, IValidator<CreateTeacherAssignmentRequest> createValidator)
    {
        _service = service;
        _createValidator = createValidator;
    }

    /// <summary>Admin sees any combination of filters; Teachers are always scoped to their own grants
    /// (used to populate the "which class/subject can I create an assignment for" picker).</summary>
    [HttpGet]
    [Authorize(Roles = $"{RoleName.Admin},{RoleName.Teacher}")]
    public async Task<IActionResult> GetAll([FromQuery] TeacherAssignmentQuery query, CancellationToken ct) =>
        Ok(await _service.GetAllAsync(query, ct));

    [HttpPost]
    [Authorize(Roles = RoleName.Admin)]
    public async Task<IActionResult> Create(CreateTeacherAssignmentRequest request, CancellationToken ct)
    {
        await _createValidator.ValidateAndThrowAsync(request, ct);
        var result = await _service.CreateAsync(request, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = RoleName.Admin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}
