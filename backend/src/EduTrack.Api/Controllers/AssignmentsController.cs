using EduTrack.Application.DTOs;
using EduTrack.Application.Interfaces;
using EduTrack.Domain.Enums;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.Api.Controllers;

[ApiController]
[Route("api/v1/assignments")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;
    private readonly IValidator<CreateAssignmentRequest> _createValidator;
    private readonly IValidator<UpdateAssignmentRequest> _updateValidator;
    private readonly IValidator<UpdateAssignmentStatusRequest> _statusValidator;

    public AssignmentsController(
        IAssignmentService assignmentService,
        IValidator<CreateAssignmentRequest> createValidator,
        IValidator<UpdateAssignmentRequest> updateValidator,
        IValidator<UpdateAssignmentStatusRequest> statusValidator)
    {
        _assignmentService = assignmentService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _statusValidator = statusValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] AssignmentQuery query, CancellationToken ct) =>
        Ok(await _assignmentService.GetAllAsync(query, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        Ok(await _assignmentService.GetByIdAsync(id, ct));

    [HttpPost]
    [Authorize(Roles = RoleName.Teacher)]
    public async Task<IActionResult> Create(CreateAssignmentRequest request, CancellationToken ct)
    {
        await _createValidator.ValidateAndThrowAsync(request, ct);
        var result = await _assignmentService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = RoleName.Teacher)]
    public async Task<IActionResult> Update(Guid id, UpdateAssignmentRequest request, CancellationToken ct)
    {
        await _updateValidator.ValidateAndThrowAsync(request, ct);
        return Ok(await _assignmentService.UpdateAsync(id, request, ct));
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = RoleName.Teacher)]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateAssignmentStatusRequest request, CancellationToken ct)
    {
        await _statusValidator.ValidateAndThrowAsync(request, ct);
        return Ok(await _assignmentService.UpdateStatusAsync(id, request, ct));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = RoleName.Teacher)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _assignmentService.DeleteAsync(id, ct);
        return NoContent();
    }
}
