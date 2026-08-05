using EduTrack.Application.DTOs;
using EduTrack.Application.Interfaces;
using EduTrack.Domain.Enums;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduTrack.Api.Controllers;

[ApiController]
[Route("api/v1")]
[Authorize]
public class SubmissionsController : ControllerBase
{
    private readonly ISubmissionService _submissionService;
    private readonly IValidator<CreateSubmissionRequest> _createValidator;
    private readonly IValidator<GradeSubmissionRequest> _gradeValidator;

    public SubmissionsController(
        ISubmissionService submissionService,
        IValidator<CreateSubmissionRequest> createValidator,
        IValidator<GradeSubmissionRequest> gradeValidator)
    {
        _submissionService = submissionService;
        _createValidator = createValidator;
        _gradeValidator = gradeValidator;
    }

    [HttpGet("assignments/{assignmentId:guid}/submissions")]
    [Authorize(Roles = $"{RoleName.Teacher},{RoleName.Admin}")]
    public async Task<IActionResult> GetForAssignment(Guid assignmentId, [FromQuery] SubmissionQuery query, CancellationToken ct) =>
        Ok(await _submissionService.GetForAssignmentAsync(assignmentId, query, ct));

    [HttpGet("assignments/{assignmentId:guid}/submissions/mine")]
    [Authorize(Roles = RoleName.Student)]
    public async Task<IActionResult> GetMine(Guid assignmentId, CancellationToken ct)
    {
        var result = await _submissionService.GetMySubmissionAsync(assignmentId, ct);
        return result is null ? NoContent() : Ok(result);
    }

    [HttpPost("assignments/{assignmentId:guid}/submissions")]
    [Authorize(Roles = RoleName.Student)]
    public async Task<IActionResult> Submit(Guid assignmentId, CreateSubmissionRequest request, CancellationToken ct)
    {
        await _createValidator.ValidateAndThrowAsync(request, ct);
        var result = await _submissionService.SubmitAsync(assignmentId, request, ct);
        return Ok(result);
    }

    [HttpGet("submissions/{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        Ok(await _submissionService.GetByIdAsync(id, ct));

    [HttpPatch("submissions/{id:guid}/grade")]
    [Authorize(Roles = RoleName.Teacher)]
    public async Task<IActionResult> Grade(Guid id, GradeSubmissionRequest request, CancellationToken ct)
    {
        await _gradeValidator.ValidateAndThrowAsync(request, ct);
        return Ok(await _submissionService.GradeAsync(id, request, ct));
    }
}
